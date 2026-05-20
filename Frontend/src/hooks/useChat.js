import { useCallback, useEffect, useRef, useState } from 'react';

import { sendChatMessage } from '@/src/api/endpoints/orchestration';
import {
  TIME_SLOTS,
  buildDateOptions,
  extractClockHour,
  extractIntentDateKey,
  validateIntentClock,
  validateIntentDate,
} from '@/src/constants/booking';
import { useAuth } from '@/src/context/AuthContext';
import { rankByMatch, resolveCoordinates } from '@/src/services/matchingService';
import { getServices } from '@/src/services/serviceService';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Match the latest user message against common greetings in English /
// Urdu-flavored English. We use this to short-circuit the assistant's
// LLM reply with a curated "what can I help with" welcome card.
const GREETING_RE = /^\s*(hi+|hey+|hello+|hola+|yo+|sup+|salam+a*t*|as[- ]?salam[ou]?[- ]?alaikum|assalam(u)?[- ]?o?[- ]?alaikum|aoa|namaste|namaskar|good\s+(morning|afternoon|evening|day)|gm|ge|ga)[\s!.,?]*$/i;

function isGreeting(text = '') {
  return GREETING_RE.test(text.trim());
}

function formatHistory(messages) {
  return messages
    .filter((m) => m.role !== 'system')
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
    .join('\n');
}

// Map free-text service strings from the AI (e.g. "AC Technician", "Plumber")
// to a known category id from the local catalog. Returns null when no match.
const SERVICE_KEYWORD_MAP = [
  { ids: ['ac-repair'], words: ['ac', 'air conditioner', 'cooling', 'aircon'] },
  { ids: ['plumber'], words: ['plumb', 'tap', 'leak', 'pipe', 'drain'] },
  { ids: ['electrician'], words: ['electric', 'wiring', 'wire', 'light', 'fan', 'switch'] },
  { ids: ['cleaning'], words: ['clean', 'maid', 'cleaner', 'sweep', 'broom', 'dust', 'mop'] },
  { ids: ['carpentry'], words: ['carpent', 'wood', 'furniture'] },
  { ids: ['tutoring'], words: ['tutor', 'teacher', 'tuition'] },
  { ids: ['beauty'], words: ['beauty', 'salon', 'makeup', 'hair', 'parlour'] },
  { ids: ['catering'], words: ['cater', 'cook', 'chef', 'food'] },
];

function inferCategoryIds(serviceText = '') {
  const text = serviceText.toLowerCase();
  if (!text) return [];
  const matches = SERVICE_KEYWORD_MAP.filter((entry) =>
    entry.words.some((w) => text.includes(w)),
  );
  const ids = matches.flatMap((m) => m.ids);
  return Array.from(new Set(ids));
}

// Rank the catalog for a chat intent using the weighted match algorithm — a
// blend of review rating and proximity to the user's stated address. See
// matchingService.rankByMatch.
async function findMatchingServices(intent) {
  if (!intent?.service) return [];
  const categoryIds = inferCategoryIds(intent.service);
  try {
    const items = await getServices({
      categoryIds,
      search: categoryIds.length ? '' : intent.service,
      sortBy: 'rating',
      max: 10,
    });
    const userCoords = resolveCoordinates(intent.location || '');
    return rankByMatch(items, userCoords).slice(0, 3);
  } catch (err) {
    return [];
  }
}

export function useChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text) => {
      const trimmed = text?.trim();
      if (!trimmed || loading) return;

      const userMsg = { id: makeId(), role: 'user', text: trimmed };
      const historyString = formatHistory([...messages, userMsg]);

      setMessages((prev) => [...prev, userMsg]);
      setError(null);
      setLoading(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await sendChatMessage({
          message: trimmed,
          history: historyString,
          signal: controller.signal,
        });

        const replyText =
          result?.message ||
          (result?.success === false ? 'Something went wrong.' : 'No response from server.');

        const intent = result?.intent || null;
        const hasCompleteIntent =
          !!intent && !!intent.service && !!intent.location && !!intent.time;

        // When intent looks complete, double-check that the requested clock
        // time fits our 10 AM–9 PM slots and the date fits the next 30 days.
        // If either is off, we suppress suggestions and instead surface
        // tappable pills so the user can pick a valid value in one tap.
        let clockState = 'ok';
        let dateState = 'ok';
        if (hasCompleteIntent) {
          clockState = validateIntentClock(intent.time);
          dateState = validateIntentDate(intent.time);
        }
        // Flag if the LLM gave us no clock at all OR an out-of-range one.
        // Same for dates. This catches the case where the user said only
        // "31st December 2026" with no time, or only "9 PM" with no date.
        const needsTimePick = clockState !== 'ok';
        const needsDatePick = dateState !== 'ok';
        const slotIssue = needsTimePick || needsDatePick;

        // When only ONE half of the time is out of range, preserve the
        // still-valid half so the user keeps it when they tap a pill. We
        // serialise the surviving clock / date back to a canonical phrase the
        // LLM can re-ingest cleanly.
        let preservedTimeText = null;
        let preservedDateText = null;
        if (hasCompleteIntent) {
          if (clockState === 'ok' && needsDatePick) {
            const hh = extractClockHour(intent.time);
            if (hh !== null) {
              const meridian = hh >= 12 ? 'PM' : 'AM';
              const h12 = hh % 12 || 12;
              preservedTimeText = `${h12}:00 ${meridian}`;
            }
          }
          if (dateState === 'ok' && needsTimePick) {
            const key = extractIntentDateKey(intent.time);
            if (key) {
              const opt = buildDateOptions().find((d) => d.key === key);
              if (opt) preservedDateText = opt.label;
            }
          }
        }

        const suggestions =
          hasCompleteIntent && !slotIssue ? await findMatchingServices(intent) : [];

        // Build a richer "what does the user want?" string by joining all the
        // user's messages in this conversation. Kept on the message so future
        // surfaces can use it; the booking form no longer auto-prefills with it.
        const userTranscript = [...messages.filter((m) => m.role === 'user'), userMsg]
          .map((m) => m.text.trim())
          .filter(Boolean)
          .join('. ');

        // If the user just greeted us, override the LLM reply with a curated
        // welcome card that lists the services we provide as tappable chips.
        const greeted = isGreeting(trimmed) && !hasCompleteIntent;

        // Override the reply text with a slot-aware notice when the user's
        // requested time/date is missing or outside our bookable window.
        let finalText = replyText;
        const timeMissing = clockState === 'no_clock';
        const dateMissing = dateState === 'no_date';
        if (needsTimePick && needsDatePick) {
          if (timeMissing && dateMissing) {
            finalText = `When would you like the service? Pick a date and a time below:`;
          } else {
            finalText = `That time and date aren't bookable. Pick one of the slots below.`;
          }
        } else if (needsTimePick) {
          finalText = timeMissing
            ? `What time works best? Pick a slot below:`
            : `Sorry, bookings are only available between 10:00 AM and 9:00 PM. Pick a time below:`;
        } else if (needsDatePick) {
          finalText = dateMissing
            ? `Which day works best? Pick a date below:`
            : `Sorry, we can only book within the next 30 days. Pick a date below:`;
        } else if (greeted) {
          finalText = `Hi! I'm Madadgar — your AI service assistant. Tell me what you need and I'll find and book a trusted provider for you. We provide:`;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: 'assistant',
            text: finalText,
            intent,
            suggestions,
            needsTimePick,
            needsDatePick,
            availableTimeSlots: needsTimePick ? TIME_SLOTS : null,
            availableDateOptions: needsDatePick ? buildDateOptions() : null,
            preservedTimeText,
            preservedDateText,
            showServiceCategories: greeted,
            sourceUserText: userTranscript,
          },
        ]);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message);
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: 'assistant', text: `⚠️ ${err.message}`, isError: true },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, user?.uid],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setLoading(false);
  }, []);

  return { messages, send, reset, loading, error };
}