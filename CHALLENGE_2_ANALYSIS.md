# Challenge 2 Analysis — AI Service Orchestrator for Informal Economy

**Project:** Madadgar — AI Service Orchestrator
**Analysed:** 2026-05-21
**Scope:** Frontend (Expo/React Native) + Backend (Express) against the
"Challenge 2" requirements in *Google Antigravity Hackathon - Challenges.pdf*.

---

## Headline verdict

| View | Strict (fully done) | With partial credit |
|---|---|---|
| **Initial Requirements** (Problem Statement, 6) | 6 / 6 — **100%** | **~100%** |
| **System Requirements** (detailed, 7) | 6 / 7 — **86%** | **~94%** |
| **Deliverables** (4) | 1 / 4 | **~45%** |
| **Overall vs Challenge 2** | — | **~85%** |

**Summary:** The core user product works end-to-end — natural-language chat →
intent extraction → weighted provider matching (rating + availability +
distance) with a recommended pick → simulated booking → confirmation email →
follow-up (reminders, status emails, completion), with the assistant's reasoning
and a raw agent log visible in-app. The **one remaining gap** is the multi-agent
workflow itself: 7 of 8 backend agents are unused code, so the live pipeline is
thin. The README is also still missing. Because "Agentic Workflow" is
**mandatory** and Antigravity + Agentic Reasoning are **45% of the score**,
wiring the agent pipeline is the highest-priority remaining work.

---

## 1. Initial Requirements (Problem Statement)

> "Your system must:"

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Understand user service requests (natural language) | ✅ Done | `Backend/agents/intentAgent.js` — LLM intent extraction + heuristic fallback |
| 2 | Identify relevant providers using location/context | ✅ Done | `Frontend/src/hooks/useChat.js` `findMatchingServices`, Firestore catalog |
| 3 | Select or recommend the best provider | ✅ Done | Top-3 ranked suggestions shown in chat |
| 4 | Simulate booking and confirmation | ✅ Done | `BookingConfirmationFlow.jsx` → Firestore write + confirmation email |
| 5 | Handle follow-up interactions | ✅ Done | Status emails + `expo-notifications` appointment reminders + completion-confirmation email |
| 6 | Show complete reasoning and workflow execution | ✅ Done | In-chat "How I worked this out" sheet — friendly **Steps** + a raw **Agent Log** tab (backend trace with timestamps & data) |

**Score: 6 / 6 fully done (100%).**

---

## 2. System Requirements (detailed)

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | **Intent Understanding** — NL input; Urdu / Roman Urdu / English; extract service, location, time | ✅ Done (100%) | `intentAgent.js` detects `language` (english/roman_urdu/urdu), extracts service/location/time/intentType, replies in the same language, has a keyword guardrail + heuristic fallback. Strong. |
| 2 | **Provider Discovery** — mock dataset or Maps/Places; nearby + category match | ✅ Done (100%) | Firestore mock catalog via `getServices`; category match via `inferCategoryIds`. (Backend `LocationAgent` even has real Nominatim geocoding — but it's unused, see #7.) |
| 3 | **Matching & Ranking** — rank by distance, availability, rating; clear reasoning | ✅ Done | `matchingService.js` `rankByMatch` scores each provider on **rating + availability + distance** (weights in `MATCH_WEIGHTS`) and attaches a plain-language `reason` ("4.9★ rating · Available today · 3.2 km away"). All 14 seed services carry a simulated `availability`. |
| 4 | **Decision & Recommendation** — best provider or top options; explain decision simply | ✅ Done | Top-3 options shown with the #1 flagged `_match.recommended` and a gold **"Recommended"** badge. Each card shows the rating · availability · distance factors; the reasoning panel adds a "Recommended: …" step explaining the pick. |
| 5 | **Action Simulation (CRITICAL)** — booking confirmation, provider assignment, scheduling | ✅ Done (100%) | `BookingConfirmationFlow` simulates the booking, writes to Firestore `bookings`, shows a confirmation screen, and sends a real confirmation email. End-to-end and solid. |
| 6 | **Follow-Up Automation** — reminders, status updates, completion confirmation | ✅ Done (~95%) | Reminders ✅ (`reminderService.js` schedules a local `expo-notifications` reminder before the appointment), status updates ✅ (accept/decline emails), completion confirmation ✅ (`completed` email + `markBookingCompleted`). Minor: cross-device reminder cancellation on decline not wired. |
| 7 | **Agentic Workflow (MANDATORY)** — multiple agents / structured pipeline; planning→decision→action→follow-up; traceable logs | ⚠️ Partial (~55%) | **Biggest gap.** 8 agent files exist, but the live `Orchestrator` only runs `IntentAgent`. `Provider/Location/Ranking/Decision/Booking/Followup/Notification` agents are written **but never imported or executed** — effectively dead code. Traceable logs are now ✅ visible in-app (Agent Log tab), but the trace stays thin because the pipeline only runs IntentAgent. |

**Score: 6 / 7 fully done (86%) — ~94% with partial credit.**

---

## 3. Mandatory Requirement: Google Antigravity

**Status: ❓ Cannot verify from the codebase.**

Antigravity is a development/orchestration platform, not a code dependency, so
its use is a *process* requirement. Notes:
- The backend LLM calls go to **OpenRouter** (`openai/gpt-5.3-chat`) in
  `intentAgent.js` — allowed ("external LLMs are allowed"), but Antigravity must
  still be "central to system logic and orchestration".
- `CHANGES_SUMMARY.html` and `TRACE_AND_HISTORY.html` exist in the repo root —
  these are likely Antigravity workplan/trace exports and should be kept as
  evidence for the Antigravity + Agent-Trace deliverables. **Confirm and
  reference them.**

---

## 4. Deliverables

| # | Deliverable | Status |
|---|---|---|
| 1 | Working Prototype — Mobile App (MUST) | ✅ Done — substantial Expo/React Native app. Web App (optional) — not present (fine). |
| 2 | Demo Video (3–5 min) | ❓ Not in repo — produce it; must show input → understanding → matching → booking → follow-up. |
| 3 | Agent Trace / Logs | ⚠️ Partial — the agent log is now shown in-app (Agent Log tab in the chat reasoning sheet); still thin because only IntentAgent runs live. `TRACE_AND_HISTORY.html` may also cover this. |
| 4 | Documentation (README) | ❌ Missing — root `README.md` is just "# HackathonProject". Needs architecture, Antigravity usage, APIs/tools, assumptions. |

---

## 5. Evaluation-criteria exposure

| Criterion | Weight | Current standing |
|---|---|---|
| Use of Google Antigravity | 25% | At risk — must be evidenced (traces, README) |
| Agentic Reasoning & Workflow | 20% | Weak — agents not wired into one pipeline |
| Matching Quality & Decision Logic | 20% | Strong ✅ — 3-factor weighted ranking + recommended pick + reasoning |
| Action Simulation & Execution | 15% | Strong ✅ |
| Technical Implementation | 10% | Decent — but dead/unused backend agents hurt |
| Innovation & UX | 10% | Strong ✅ — polished app |

---

## 6. Critical gaps & recommended fixes (priority order)

1. **Wire the agentic pipeline (MANDATORY, highest impact).** Make the
   `Orchestrator` actually call the chain — `Intent → Provider → Location →
   Ranking → Decision → Booking → Followup → Notification` — so the trace shows
   a real multi-agent flow. Today only `IntentAgent` runs.
2. ~~Surface the agent trace in the app.~~ ✅ **Done (2026-05-21)** — the chat's
   "How I worked this out" sheet shows friendly Steps + a raw Agent Log tab
   (agent, message, timestamp, data).
3. ~~Add reminders (follow-up automation).~~ ✅ **Done (2026-05-21)** —
   `reminderService.js` schedules a local `expo-notifications` reminder before
   the appointment; completion-confirmation email added.
4. ~~Add `availability` to the ranking + a recommendation reason.~~ ✅ **Done
   (2026-05-21)** — `rankByMatch` now scores rating + availability + distance,
   flags the top pick, and attaches a plain-language reason.
5. **Write the README** — architecture, Antigravity usage, tools/APIs,
   assumptions.
6. **Record the demo video** covering the full input→follow-up flow.

---

## 7. Scoring summary

- **Initial Requirements:** 6 / 6 done — **100%**
- **System Requirements:** 6 / 7 done — **86% strict, ~94% weighted**
- **Deliverables:** 1 / 4 fully done — **~45%**
- **Overall completion vs Challenge 2: ~85%**

Only one requirement is left: the **agentic-workflow wiring** (#7) — plus the
README. Those are what stand between ~85% and a competitive submission.

---

## Progress updates

- **2026-05-21 — Initial Requirement #5 (Handle follow-up interactions) → ✅ Done.**
  Installed `expo-notifications` (SDK 54). Added `src/services/reminderService.js`
  which schedules a local appointment reminder, with a `REMINDER_TEST_SECONDS`
  knob (fires seconds from now) for demoing without waiting an hour. Wired
  reminder scheduling into `saveBookingForUser`, and added a `completed`
  confirmation email (`markBookingCompleted` → `Backend/routes/email.js`).
  System Requirement #6 (Follow-Up Automation) also moved to ✅.

- **2026-05-21 — Initial Requirement #6 (Show complete reasoning & workflow
  execution) → ✅ Done.** Each assistant turn now authors human-worded workflow
  steps (`buildWorkflowSteps` in `useChat.js`) and keeps the raw backend agent
  trace. The chat shows a collapsed "How I worked this out" pill that opens a
  scrollable bottom sheet with two tabs: **Steps** (friendly) and **Agent Log**
  (raw trace — agent, message, timestamp, data). Initial Requirements now 6/6.

- **2026-05-21 — System Requirements #3 (Matching & Ranking) + #4 (Decision &
  Recommendation) → ✅ Done.** `rankByMatch` in `matchingService.js` now scores
  every provider on three weighted criteria — rating (0.45) + availability
  (0.30) + proximity (0.25) — and attaches a plain-language `reason`. Added a
  simulated `availability` field to all 14 seed services. The chat suggestion
  cards show rating · availability · distance, and the #1 pick gets a gold
  **"Recommended"** badge; the reasoning panel gains a "Recommended: …" step.
  System Requirements now 6/7 (only #7, the agentic workflow, remains).
