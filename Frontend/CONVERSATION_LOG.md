# Conversation Log — Madadgar Frontend

A running record of debugging/feature work done with Claude Code. Newest session at the top.

---

## Session — 2026-05-20

### 1. Chat date/time selection was picking the wrong day/time

**Reported:** Whatever date the user gave, the chat selected a neighboring day
(e.g. "May 22" → May 23); times were sometimes wrong too.

**Root causes found & fixed:**

- **Timezone (UTC) off-by-one.** `toISOString()` returns UTC. The user is in
  Pakistan (UTC+5), so any date built at local midnight rolled back to the
  previous calendar day in the ISO key.
  - Added a local-time `isoKey()` helper in `src/constants/booking.js` and used
    it in `buildDateOptions()` so the date `key` and `label` always agree.
  - `extractClockHour()` now also parses 24-hour times ("15:00"), not only
    `am/pm`.
- **Weekday vs explicit-date precedence.** For "30 May 8:00 AM Sat",
  `extractIntentDateKey()` matched the weekday "Sat" *before* the explicit date
  "30 May", snapping to the nearest Saturday (May 23) instead of May 30.
  - Reordered `extractIntentDateKey()`: today/tomorrow → explicit date →
    weekday (last). Explicit dates now win.
- **Booking form parser gaps.** `parsePrefilledTime()` in
  `BookingConfirmationFlow.jsx` only understood today/tomorrow/weekday and
  silently defaulted unmatched times to 11:00 AM.
  - Rewrote it to reuse `extractIntentDateKey()` / `extractClockHour()`, plus a
    new `hourToSlot()` that snaps any in-range hour to the correct slot.

**Files changed:** `src/constants/booking.js`,
`src/components/BookingConfirmationFlow/BookingConfirmationFlow.jsx`.

### 2. Open item — silent weekday/date conflict

When the user types a contradictory phrase like "Sun, 30 May" (30 May is a
Saturday), the app correctly uses 30 May but never warns that "Sunday" didn't
match. Diagnosed as a UX gap, not a bug. **Offered** a `detectWeekdayConflict()`
helper to surface a heads-up — awaiting user decision (inform vs ask to confirm).

### 3. Open item — image 3 / "10:00 PM" check

A request for "next Sunday at 10:00 PM" returned bookable plumbers, but 10 PM is
outside the 10 AM–9 PM window. Pending confirmation of whether that screenshot
was taken after the latest reload.

### 4. Favourites not syncing across screens

**Reported:** Favouriting on one screen didn't show on the Favourites screen;
unfavouriting didn't remove the item from the Favourites screen. Not
instantaneous.

**Root cause:** No shared favourites state. Each `ServiceCard` fetched its own
favourite status from Firestore into local state; the Favourites screen kept its
own list and only loaded once on mount. Changes on one screen never reached
others.

**Fix:** Introduced a shared `FavouritesContext` as the single source of truth.

- New `src/context/FavouritesContext.jsx` — holds the favourites list, exposes
  `isFavourite()`, `toggle()` (optimistic, with Firestore rollback) and
  `refresh()`.
- Wired `FavouritesProvider` into `app/_layout.jsx` (inside `AuthProvider`).
- `ServiceCard.jsx` now reads `isFavourite`/`toggle` from the context instead of
  its own state + per-card Firestore reads.
- `app/(tabs)/favourites.jsx` (`TakerFavourites`) now renders from the context
  list — favouriting/unfavouriting anywhere updates it instantly.

**Files changed:** `src/context/FavouritesContext.jsx` (new), `app/_layout.jsx`,
`src/components/ServiceCard/ServiceCard.jsx`, `app/(tabs)/favourites.jsx`.

**Follow-up:** A `ReferenceError: Property 'getFavouritesForUser' doesn't exist`
appeared after these changes. Verified the source was correct — it was a stale
Metro bundle (a new file was added). Resolved by restarting with
`npx expo start -c`.

### 5. Raw Firebase errors shown on login/signup

**Reported:** Wrong credentials on the login/signup screens showed the raw
Firebase error string (e.g. "Firebase: Error (auth/invalid-credential).")
instead of a friendly, UX-appropriate message.

**Fix:** Added `getAuthErrorMessage(error)` to `src/services/authService.js` — it
maps Firebase Auth error codes (`auth/invalid-credential`,
`auth/email-already-in-use`, `auth/too-many-requests`,
`auth/network-request-failed`, etc.) to short, user-friendly messages, with a
generic fallback for unknown codes. The three auth screens now display
`getAuthErrorMessage(err)` in their catch blocks instead of `err.message`.

**Files changed:** `src/services/authService.js`,
`src/screens/Auth/LoginScreen/LoginScreen.jsx`,
`src/screens/Auth/ServiceTakerSignupScreen/ServiceTakerSignupScreen.jsx`,
`src/screens/Auth/ProviderSignupScreen/ProviderSignupScreen.jsx`.

### 6. Booking email service

**Requested:** Send emails for booking events — and it must be **totally free**.

**Approach chosen:** Send via the existing Express backend over **Brevo's SMTP
relay** using **Nodemailer** (free tier: 300 emails/day, no credit card, only a
single verified sender address needed).

**Events covered:**

- Booking created → emails the **taker** (confirmation) and the **provider**
  ("new booking request").
- Provider accepts → emails the taker.
- Provider declines → emails the taker.

**Backend (`/Backend`):**

- `utils/email.js` (new) — `sendEmail()` transport over SMTP via Nodemailer.
  Best-effort: never throws; skips cleanly if SMTP vars are unset.
- `package.json` — added the `nodemailer` dependency.
- `routes/email.js` (new) — `POST /api/email/booking` `{ event, booking }`,
  builds branded HTML templates and sends to the right recipients.
- `server.js` — registered `app.use('/api/email', emailRoutes)`.

**Frontend (`/Frontend`):**

- `src/api/endpoints/email.js` (new) — `sendBookingEmail({ event, booking })`.
- `src/services/bookingService.js` — `saveBookingForUser` fires the `created`
  email; `acceptBooking` / `declineBooking` fetch the booking and fire the
  `accepted` / `declined` emails. All best-effort (fire-and-forget) so email
  never blocks a booking.
- `src/screens/ServiceDetails/ServiceDetails.jsx` — booking now stores
  `takerEmail`, `takerName`, `providerEmail` so later status emails have
  recipients.

**Required setup (one-time, by the user):**
Add to `Backend/.env` (values from Brevo's SMTP settings tab):

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=<Login from Brevo>
SMTP_PASS=<Password / SMTP key from Brevo>
EMAIL_SENDER_NAME=Madadgar
EMAIL_SENDER_ADDRESS=your-verified-sender@example.com
```

Steps: verify a sender email in Brevo under Senders & Domains → copy the SMTP
server / Port / Login / Password from the SMTP settings tab into the vars above
→ restart the backend. Until SMTP vars are set, sends are skipped (logged) and
bookings still work normally.

**Note:** Demo/seed providers may lack an `email` field — the provider
notification simply skips for them; real registered providers have it.

### 7. Show provider email in the Details tab

**Requested:** Display the provider's email address in the Details tab of the
service details screen.

**Fix:** Added an email row (mail icon + address) under the Provider card in
`DetailsTab`, shown only when `provider.email` exists.

**Files changed:** `src/screens/ServiceDetails/ServiceDetails.jsx`,
`src/screens/ServiceDetails/ServiceDetails.styles.js`.

### 8. Follow-up interactions — reminders + completion email (Challenge 2, Point 5)

**Context:** Working through the Challenge 2 gaps step by step. Point 5 of the
initial requirements ("handle follow-up interactions") was partial — only
accept/decline status emails existed; no reminders.

**Implemented:**

- Installed `expo-notifications` (SDK 54). Read the v54 docs first (AGENTS.md).
- `src/services/reminderService.js` (new) — schedules a local appointment
  reminder via `Notifications.scheduleNotificationAsync` (DATE trigger).
  Has a `REMINDER_TEST_SECONDS` knob (default 15) so reminders fire seconds
  from now for demos, vs `REMINDER_LEAD_MINUTES` (60) before the appointment in
  normal mode. Handles permission + the Android channel.
- `src/services/bookingService.js` — `saveBookingForUser` schedules the
  reminder and stores `reminderId` / `reminderAt` on the booking;
  `markBookingCompleted` now fires a `completed` email via `notifyBookingEvent`.
- `Backend/routes/email.js` — added the `completed` booking-email event.
- `app.json` — added the `expo-notifications` plugin.

**Files changed:** `src/services/reminderService.js` (new),
`src/services/bookingService.js`, `app.json`, `Backend/routes/email.js`.

**Result:** Challenge 2 Initial Requirement #5 → ✅ Done; System Requirement #6
(Follow-Up Automation) → ✅ Done. `CHALLENGE_2_ANALYSIS.md` updated
(overall ~70% → ~75%).

**Known minor gap:** the reminder is scheduled on the taker's device;
cancelling it when the provider declines (a cross-device action) is not wired.

### 9. Reasoning & workflow trace UI (Challenge 2, Point 6)

**Context:** Point 6 of the initial requirements — "show complete reasoning and
workflow execution." The backend already returned an agent trace (`logs`); the
frontend discarded it.

**Implemented:**

- `useChat.js` — `buildWorkflowSteps()` authors human-worded steps per turn;
  each assistant message now carries `steps` (friendly) + `trace` (raw backend
  logs).
- `ChatScreen.jsx` — a collapsed "How I worked this out" pill under assistant
  messages opens a scrollable bottom-sheet `Modal` with two tabs:
  **Steps** (friendly timeline) and **Agent Log** (raw trace: agent, message,
  timestamp, JSON data).
- UX iteration: first tried expand-in-place inline — it overlapped the chips
  because resizing a FlatList cell is fragile. Switched to the bottom sheet
  (renders outside the FlatList, scrollable, keeps the chat compact).

**Files changed:** `src/hooks/useChat.js`, `src/screens/Chat/ChatScreen.jsx`,
`src/screens/Chat/ChatScreen.styles.js`.

**Result:** Challenge 2 Initial Requirement #6 → ✅ Done — Initial Requirements
now **6 / 6**. `CHALLENGE_2_ANALYSIS.md` updated (overall ~75% → ~78%).

### 8. Provider matching algorithm (rating + proximity)

**Requested:** Rank providers by two weighted criteria — review rating and
proximity to the user's address — and add realistic lat/lng to the mock data.

**Implementation:**

- `src/services/matchingService.js` (new) — `haversineKm()` great-circle
  distance, `resolveCoordinates()` (free-text address → lat/lng via an offline
  Pakistani city/neighbourhood lookup, no geocoding API), and `rankByMatch()`
  which scores each candidate `0.6 × rating + 0.4 × proximity`
  (weights in `MATCH_WEIGHTS`). Proximity score is `1 − distance / 25km`,
  clamped to 0–1; candidates with no coordinates get a neutral 0.5.
- `src/services/seedService.js` — added realistic `lat`/`lng` to every provider
  and service (spread across real Karachi / Lahore / Islamabad coordinates).
- `src/hooks/useChat.js` — `findMatchingServices` now ranks results with
  `rankByMatch`, using the chat intent's location as the user's address.
- `src/screens/Chat/ChatScreen.jsx` — suggestion cards now show the distance
  ("X.X km") so the proximity ranking is visible.

**Action needed:** Tap "Reseed Demo Data" in Profile so the existing
services/providers in Firestore pick up the new `lat`/`lng` fields.

### 9. ⏳ DEFERRED — Switch the matching system to real data

**Status:** Not started. The user will implement this later and asked to keep
this reference here. When picking it up, start from this section.

**Goal:** Replace the mocked inputs of the matching algorithm with real data.
The algorithm itself (`matchingService.js` — `haversineKm`, `rankByMatch`,
`MATCH_WEIGHTS`) does **not** change. Only three data inputs become real:

1. **Provider / service coordinates** — captured at provider signup instead of
   hardcoded in `seedService.js`. Options: GPS via `expo-location`
   ("use my current location"), a `react-native-maps` pin picker, or geocoding
   the typed address. Store real `lat`/`lng` on the provider/service docs.
2. **User location** — replace the offline `resolveCoordinates()` lookup table.
   Options: device GPS via `expo-location` (best, free, no key) for
   "near me", or geocode a typed address. Keep `resolveCoordinates()` as a
   fallback when GPS is denied / address unresolved.
3. **Ratings** — compute `rating` / `reviewCount` from the real `reviews`
   collection (aggregate on new review via a Cloud Function / backend, or
   aggregate on read) instead of the static seeded number.

**Cheapest path (no API keys, no cost):** `expo-location` GPS for both provider
signup and user location + aggregate ratings from existing reviews. A geocoding
API is only needed if users must type arbitrary addresses.

**Infrastructure if geocoding typed addresses:**

- A geocoding provider — Nominatim/OpenStreetMap (free, no key), or Google /
  LocationIQ / Geoapify / Mapbox (free tiers, key required).
- API keys must NOT be in the app — add a backend route
  `GET /api/geo/geocode?address=...` that calls the provider server-side.
- `npx expo install expo-location` + location permission strings in `app.json`.
- At real scale: geohashing (`geofire-common`) for "within X km" Firestore
  queries — not needed for the hackathon.

**Files that would change:** `ProviderSignupScreen.jsx` (capture coordinates),
`serviceService.js` `addService` (store lat/lng), `matchingService.js`
(`resolveCoordinates` → GPS/geocoding, kept as fallback), `useChat.js` + booking
form (user coords from GPS/geocoded address), `app.json` (permissions); new:
reviews→rating aggregation, optional `/api/geo/geocode` backend route.
`seedService.js` stops being the source of coordinates.

### 10. Matching & Ranking + Decision/Recommendation (Challenge 2, System Req #3 & #4)

**Context:** System Requirements #3 (Matching & Ranking) and #4 (Decision &
Recommendation) — done together since #3 produces the ranking + reasoning that
#4 presents.

**Implemented:**
- `matchingService.js` — `rankByMatch` now scores each provider on **three**
  weighted criteria: rating (0.45) + availability (0.30) + proximity (0.25),
  via `MATCH_WEIGHTS`. Each result's `_match` carries `availabilityText`, a
  plain-language `reason`, and the #1 is flagged `recommended`.
- `seedService.js` — added a simulated `availability` (0–1) to all 14 services.
- `ChatScreen.jsx` — suggestion cards show rating · availability · distance; the
  #1 pick gets a gold **"Recommended"** badge.
- `useChat.js` — `buildWorkflowSteps` adds a "Recommended: …" step with the
  reason, and notes ranking is by rating, availability & distance.

**Files changed:** `src/services/matchingService.js`,
`src/services/seedService.js`, `src/screens/Chat/ChatScreen.jsx`,
`src/screens/Chat/ChatScreen.styles.js`, `src/hooks/useChat.js`.

**Result:** Challenge 2 System Requirements #3 & #4 → ✅ Done — System
Requirements now **6 / 7** (only #7, the agentic workflow, remains).
`CHALLENGE_2_ANALYSIS.md` updated (overall ~78% → ~85%).

**Action needed:** Tap "Reseed Demo Data" in Profile so existing services pick
up the new `availability` field.
