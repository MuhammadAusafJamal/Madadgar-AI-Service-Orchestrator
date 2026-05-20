// Centralised booking-slot constants so the chat validator, the booking sheet,
// and any future surfaces all share the same canonical times/dates.

export const TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM',
  '9:00 PM',
];

export const DATE_DAYS = 30;

export const buildDateOptions = () => {
  const today = new Date();
  const opts = [];
  for (let i = 0; i < DATE_DAYS; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    let label;
    if (i === 0) label = 'Today';
    else if (i === 1) label = 'Tomorrow';
    else {
      label = d.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }
    opts.push({ key: d.toISOString().slice(0, 10), label });
  }
  return opts;
};

// Return the 24-hour hour value from a phrase like "11 PM" or "9:30 am".
// Returns null when no clock pattern is found.
export const extractClockHour = (text = '') => {
  if (typeof text !== 'string') return null;
  const m = text.toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (!m) return null;
  let hh = parseInt(m[1], 10);
  const meridian = m[3].toUpperCase();
  if (meridian === 'PM' && hh !== 12) hh += 12;
  if (meridian === 'AM' && hh === 12) hh = 0;
  return hh;
};

// Validate the intent's time string against the bookable slot window.
// Returns 'ok' | 'out_of_range' | 'no_clock'.
// "no_clock" means we couldn't find ANY indication of time-of-day — neither an
// explicit clock nor a period word (morning / afternoon / evening / etc.).
// Period words map to a default slot in parsePrefilledTime, so we treat them
// as "ok" here and let the booking form pick a sensible default.
export const validateIntentClock = (text = '') => {
  const hh = extractClockHour(text);
  if (hh !== null) {
    if (hh < 10 || hh > 21) return 'out_of_range';
    return 'ok';
  }
  if (typeof text === 'string') {
    const lower = text.toLowerCase();
    if (/\b(morning|afternoon|evening|night|noon|asap|now)\b/.test(lower)) {
      return 'ok';
    }
  }
  return 'no_clock';
};

// Try to extract a calendar date from free-form text. Returns a `YYYY-MM-DD`
// key if a specific calendar reference is found (e.g. "31st May", "May 31",
// "tomorrow", "monday"), or null if the string is vague ("when available",
// "morning", "asap").
const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

const isoKey = (d) => d.toISOString().slice(0, 10);

export const extractIntentDateKey = (text = '') => {
  if (typeof text !== 'string') return null;
  const lower = text.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (/\btoday\b/.test(lower) || /\bnow\b/.test(lower) || /\basap\b/.test(lower)) {
    return isoKey(today);
  }
  if (/\btomorrow\b/.test(lower)) {
    const d = new Date(today);
    d.setDate(today.getDate() + 1);
    return isoKey(d);
  }
  // Weekday → next occurrence
  for (let i = 0; i < WEEKDAYS.length; i += 1) {
    const day = WEEKDAYS[i];
    const re = new RegExp(`\\b${day.slice(0, 3)}\\w*\\b`);
    if (re.test(lower)) {
      const diff = (i - today.getDay() + 7) % 7 || 7;
      const d = new Date(today);
      d.setDate(today.getDate() + diff);
      return isoKey(d);
    }
  }
  // "31st may" / "may 31" / "31 may"
  const dm = lower.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*/);
  const md = lower.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2})/);
  let day = null;
  let monthIdx = null;
  if (dm) {
    day = parseInt(dm[1], 10);
    monthIdx = MONTHS.findIndex((m) => m.startsWith(dm[2]));
  } else if (md) {
    monthIdx = MONTHS.findIndex((m) => m.startsWith(md[1]));
    day = parseInt(md[2], 10);
  }
  if (day !== null && monthIdx >= 0) {
    let year = today.getFullYear();
    let candidate = new Date(year, monthIdx, day);
    if (candidate < today) {
      year += 1;
      candidate = new Date(year, monthIdx, day);
    }
    return isoKey(candidate);
  }
  return null;
};

// Validate the intent's date against the bookable window (today .. today+30).
// Returns 'ok' | 'out_of_range' | 'no_date'
export const validateIntentDate = (text = '') => {
  const key = extractIntentDateKey(text);
  if (!key) return 'no_date';
  const dateOptions = buildDateOptions();
  return dateOptions.some((d) => d.key === key) ? 'ok' : 'out_of_range';
};