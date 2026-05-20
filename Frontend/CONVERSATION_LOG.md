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
