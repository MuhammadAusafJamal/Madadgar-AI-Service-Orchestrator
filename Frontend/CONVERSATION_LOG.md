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
