import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

// Google Gemini configuration — the intent agent uses the official
// @google/genai SDK with GEMINI_API_KEY from the environment.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGemini(prompt, { json = false } = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment.');
  }
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    ...(json ? { config: { responseMimeType: 'application/json' } } : {}),
  });
  // response.text is a getter in @google/genai; guard for older shapes too.
  const text =
    typeof response.text === 'function' ? response.text() : response.text;
  return text || '';
}

// Deterministic guardrail: keywords that are unambiguously a home service.
// If the user's latest message contains any of these, we treat it as a
// service_request even if Gemini misclassified it. The matched canonical
// label is also used to back-fill `service` when the model returned null.
const SERVICE_KEYWORDS = [
  { label: 'Electrician', words: ['electrician', 'electric', 'wiring', 'switchboard', 'fan repair', 'light repair'] },
  { label: 'Plumber', words: ['plumber', 'plumbing', 'tap', 'leak', 'pipe', 'drain', 'toilet', 'faucet'] },
  { label: 'AC Repair', words: ['ac repair', 'ac technician', 'ac tech', 'air conditioner', 'aircon', 'ac '] },
  { label: 'Cleaning', words: ['cleaning', 'cleaner', 'sweeping', 'sweep', 'broom', 'dust', 'mop', 'maid'] },
  { label: 'Carpenter', words: ['carpenter', 'carpentry', 'wood work', 'furniture repair'] },
  { label: 'Tutor', words: ['tutor', 'tuition', 'teacher', 'home tuition'] },
  { label: 'Beautician', words: ['beautician', 'salon', 'makeup', 'hair', 'parlour', 'parlor'] },
  { label: 'Caterer', words: ['caterer', 'catering', 'chef', 'cook for', 'food service'] },
];

function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectServiceKeyword(text = '') {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const entry of SERVICE_KEYWORDS) {
    for (const w of entry.words) {
      // Word-boundary match handles spaces, newlines, punctuation, and
      // start/end of string uniformly. Multi-word phrases like "ac repair"
      // are escaped and matched as-is between boundaries.
      const re = new RegExp(`(^|\\W)${escapeForRegex(w.trim())}(\\W|$)`);
      if (re.test(lower)) return entry.label;
    }
  }
  return null;
}

// Pakistani cities that we recognize on their own. Areas like "DHA", "Clifton",
// "Gulshan" only count when paired with one of these (matching the prompt rules).
const KNOWN_CITIES = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'peshawar', 'quetta', 'faisalabad', 'multan', 'hyderabad', 'sialkot'];
const AREA_HINTS = ['dha', 'clifton', 'gulshan', 'gulberg', 'johar town', 'bahria', 'g-13', 'g-11', 'f-7', 'f-8', 'f-10', 'f-11', 'i-8', 'i-10', 'pwd', 'malir', 'korangi', 'saddar', 'tariq road', 'shah faisal'];

function detectLocationKeyword(text = '') {
  const lower = text.toLowerCase();
  const city = KNOWN_CITIES.find((c) => lower.includes(c));
  const area = AREA_HINTS.find((a) => lower.includes(a));
  if (city && area) return `${capitalize(area)} ${capitalize(city)}`;
  if (city) return capitalize(city);
  if (area) return null; // area without city is intentionally rejected
  return null;
}

const TIME_PATTERNS = [
  /\btoday\b/i,
  /\btomorrow\b/i,
  /\btonight\b/i,
  /\b(mon|tue|wed|thu|fri|sat|sun)(day|\b)/i,
  /\b\d{1,2}\s*(am|pm)\b/i,
  /\b(morning|afternoon|evening|night|noon)\b/i,
  /\bnow\b/i,
  /\basap\b/i,
];

function detectTimeKeyword(text = '') {
  for (const re of TIME_PATTERNS) {
    const match = text.match(re);
    if (match) return match[0];
  }
  return null;
}

function capitalize(s = '') {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Combines heuristics across the current input AND prior conversation history
// to build the best possible intent when Gemini is unavailable. This is the
// safety net so the conversation can continue end-to-end even if every Gemini
// call fails.
function heuristicIntent(userInput = '', history = '') {
  // History contains both "User:" and "Assistant:" lines. Only scan the user's
  // own messages — otherwise the assistant's own static fallbacks (which mention
  // "plumber", "today", etc.) would pollute every heuristic match.
  const userHistory = history
    .split('\n')
    .filter((line) => /^\s*User:/i.test(line))
    .map((line) => line.replace(/^\s*User:\s*/i, ''))
    .join('\n');

  const combined = `${userHistory}\n${userInput}`;
  const service = detectServiceKeyword(userInput) || detectServiceKeyword(userHistory);
  // Try the current turn first, then user history, then the combined user
  // transcript so area+city scattered across two user messages can be merged.
  const location =
    detectLocationKeyword(userInput) ||
    detectLocationKeyword(userHistory) ||
    detectLocationKeyword(combined);
  const time = detectTimeKeyword(userInput) || detectTimeKeyword(userHistory);

  // If we found ANY service in the conversation, we're in a service flow.
  // Otherwise, if the current input only looks like a location or time on its
  // own (no prior service), we still can't proceed — leave as unclear.
  const intentType = service ? 'service_request' : 'unclear';

  return {
    intentType,
    service: service || null,
    location: location || null,
    time: time || null,
    language: 'english',
  };
}

export class IntentAgent {
  static async extractIntent(userInput, history = '') {
    logger.log('Intent Agent', 'Starting intent extraction for input:', { userInput });
    try {
      const prompt = `
        You are an AI assistant for a home services application in Pakistan.
        You must extract the user's booking details based on their LATEST input, but you MUST use the CONVERSATION HISTORY to fill in any missing information (e.g. if they already mentioned the service earlier).
        
        CONVERSATION HISTORY:
        ${history}
        
        LATEST USER INPUT: "${userInput}"
        
        Extract the following information by combining the history and latest input:
        - intentType: Classify the user's latest message. Must be exactly one of:
            * "service_request" — ANY mention of a home service, trade, task, or problem that a home-services provider would handle. This includes:
                - Bare service nouns or category names: "Plumber", "Electrician", "AC Repair", "Carpenter", "Cleaning", "Sweeping", "Tutor", "Beautician", "Caterer".
                - Booking phrases: "I need an AC technician", "Book a plumber", "Mujhe electrician chahiye".
                - Problem descriptions: "My tap is leaking", "AC not cooling", "house needs cleaning".
                - Follow-ups in an ongoing booking conversation: "And for plumber?", "Try electrician instead", "Show me cleaners".
              EVEN IF the message is a single word with no verb (e.g. just "Plumber"), classify it as service_request.
            * "smalltalk" — pure greetings ("hi", "hello", "salam", "thanks", "bye"), questions about the assistant ("what can you do", "who are you", "help"), or casual chat with NO mention of any service, trade, or task.
            * "unclear" — gibberish, off-topic content (politics, news, jokes), or genuinely impossible to interpret. Do NOT use "unclear" just because details are missing — if there is any hint of a service, use "service_request".

          Examples:
            User: "Hi" → "smalltalk"
            User: "Electrician" → "service_request"
            User: "Sweeping" → "service_request"
            User: "AC Repair" → "service_request"
            User: "I need a plumber tomorrow in DHA Karachi" → "service_request"
            User: "What can you do?" → "smalltalk"
            User: "Tell me a joke" → "unclear"
        - service: The type of service requested (e.g., AC Technician, Plumber, Electrician). Convert to English. Null if intentType is not "service_request".
        - location: The specific neighborhood AND city area (e.g., DHA Karachi, G-13 Islamabad). CRITICAL: If the user provides a very generic location without specifying a city (like just 'DHA', 'Clifton', 'Phase 5', 'Gulshan'), you MUST set this field to null so we can ask them for clarification. Null if intentType is not "service_request".
        - time: The time requested (e.g., Tomorrow Morning, Today Evening). Translate to English if needed. Null if intentType is not "service_request".
        - language: Detect the language of the LATEST user input ONLY (ignore the language of earlier turns). Must be exactly one of:
            * "english" — DEFAULT. Use for pure English text, single English words like "hello", "hi", "thanks", "today", "tomorrow", short English service words ("Electrician", "AC Repair", "Plumber"), or anything ambiguous.
            * "roman_urdu" — ONLY if the LATEST input contains clearly Urdu words written in English letters (e.g., "mujhe", "chahiye", "kal", "subah", "kab", "kahan", "abhi", "jab", "ho", "hai", "aap", "kya", "shukriya"). Do NOT mark short English greetings or single English words as roman_urdu just because earlier turns were in Roman Urdu.
            * "urdu" — Proper Urdu in Arabic script.

        Respond ONLY with a valid JSON object matching this schema:
        {
          "intentType": "service_request" | "smalltalk" | "unclear",
          "service": "string or null",
          "location": "string or null",
          "time": "string or null",
          "language": "english" | "urdu" | "roman_urdu"
        }
      `;

      const responseText = await callGemini(prompt, { json: true });

      // Robust parse: strip code fences and extract the first JSON object even
      // if the model added prose before/after.
      const rawText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      let extractedData;
      try {
        extractedData = JSON.parse(rawText);
      } catch (parseErr) {
        const match = rawText.match(/\{[\s\S]*\}/);
        if (!match) {
          logger.log('Intent Agent', 'No JSON object found in model response', { rawText });
          throw parseErr;
        }
        extractedData = JSON.parse(match[0]);
      }

      // Deterministic rescue: if the user clearly mentioned a known service
      // keyword, force service_request regardless of how Gemini classified it.
      const keywordHit = detectServiceKeyword(userInput);
      if (keywordHit) {
        if (extractedData.intentType !== 'service_request') {
          logger.log('Intent Agent', 'Keyword guardrail overriding intentType to service_request', {
            keywordHit,
            originalType: extractedData.intentType,
          });
          extractedData.intentType = 'service_request';
        }
        if (!extractedData.service) {
          extractedData.service = keywordHit;
        }
      }

      logger.log('Intent Agent', 'Extracted intent successfully', extractedData);
      return extractedData;
    } catch (error) {
      logger.log('Intent Agent', 'Error extracting intent — applying heuristic fallback', {
        error: error.message,
      });
      // Gemini failed (network, quota, malformed output). Build the best intent
      // we can from current input + conversation history so the flow keeps
      // moving instead of dead-ending on every turn.
      const fallback = heuristicIntent(userInput, history);
      logger.log('Intent Agent', 'Heuristic fallback intent', fallback);
      return fallback;
    }
  }

  static async generateDynamicMessage(type, language, data) {
    try {
      // Build a language-specific rule that goes at the TOP of every prompt.
      // Putting the directive first (and using positive examples instead of
      // mentioning other languages) prevents the model from drifting into
      // Urdu when the user spoke English.
      let languageRule = '';
      if (language === 'english') {
        languageRule = `LANGUAGE RULE (NON-NEGOTIABLE):
Reply ONLY in plain English. Do NOT use Urdu, Roman Urdu, Hindi, or any other language. Do NOT mix languages. No transliteration. Examples of CORRECT English replies: "Sure, what service do you need?", "Hi! How can I help?". Examples of INCORRECT replies: "Aap ko kya chahiye?", "Mujhe batayein…".`;
      } else if (language === 'roman_urdu') {
        languageRule = `LANGUAGE RULE (NON-NEGOTIABLE):
Reply ONLY in Roman Urdu — that is, the Urdu language written using English alphabet letters. Do not write in English and do not use Arabic script. Example phrases: "Aap ko kis area mein chahiye?", "Theek hai, kal subah."`;
      } else if (language === 'urdu') {
        languageRule = `LANGUAGE RULE (NON-NEGOTIABLE):
Reply ONLY in Urdu using the proper Arabic script. Do not use English letters and do not provide a translation.`;
      }

      let prompt = '';
      if (type === 'missing_fields') {
        prompt = `${languageRule}

The user wants to book a home service but forgot some details.
Missing details: ${data.missingFields.join(', ')}.
Write a short, polite follow-up question asking ONLY for these missing details.`;
      } else if (type === 'success') {
        prompt = `${languageRule}

A booking has been successfully created.
Details: Service: ${data.service}, Provider: ${data.providerName}, Location: ${data.location}, Time: ${data.time}.
Write a short, polite confirmation message telling the user their booking is confirmed with the provider's name.`;
      } else if (type === 'suggestions') {
        prompt = `${languageRule}

The user is looking for a ${data.service} in ${data.location} for ${data.time}.
Write a SHORT (max 2 sentences) friendly message saying you've found some matching options and inviting them to tap one below to book.`;
      } else if (type === 'smalltalk') {
        prompt = `${languageRule}

You are Madadgar, a home-services booking assistant. The user said: "${data.userInput}"

Reply in 1-2 short sentences:
- If they greeted you, greet them back warmly and ask what service they need today.
- If they asked what you can do, briefly say you help them find and book trusted home service providers (plumber, electrician, AC repair, cleaning, etc.) — and ask what they're looking for.
- If their message is off-topic or unclear, politely steer them back to home services.`;
      }

      const responseText = await callGemini(prompt);
      return responseText.trim();
    } catch (error) {
      logger.log('Intent Agent', 'Error generating dynamic message', { error: error.message });
      // Fallback message
      if (type === 'missing_fields') {
        return `Please provide the following details: ${data.missingFields.join(', ')}.`;
      }
      if (type === 'suggestions') {
        return `I found some ${data.service} options in ${data.location} for ${data.time}. Tap one below to book.`;
      }
      if (type === 'smalltalk') {
        return `Hi! I'm Madadgar — I help you find and book trusted home services like plumbers, electricians, AC repair, and cleaning. What do you need today?`;
      }
      return `I have booked ${data.providerName} for ${data.service} at ${data.location} for ${data.time}.`;
    }
  }
}
