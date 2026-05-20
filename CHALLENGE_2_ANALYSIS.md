# Challenge 2 Analysis — AI Service Orchestrator for Informal Economy

**Project:** Madadgar — AI Service Orchestrator
**Analysed:** 2026-05-21
**Scope:** Frontend (Expo/React Native) + Backend (Express) against the
"Challenge 2" requirements in *Google Antigravity Hackathon - Challenges.pdf*.

---

## Headline verdict

| View | Strict (fully done) | With partial credit |
|---|---|---|
| **Initial Requirements** (Problem Statement, 6) | 5 / 6 — **83%** | **~92%** |
| **System Requirements** (detailed, 7) | 4 / 7 — **57%** | **~83%** |
| **Deliverables** (4) | 1 / 4 | **~40%** |
| **Overall vs Challenge 2** | — | **~75%** |

**Summary:** The core user product works end-to-end — natural-language chat →
intent extraction → provider matching → simulated booking → confirmation email →
follow-up (appointment reminders, status emails, completion confirmation). The
**main gaps** are: the multi-agent workflow is not actually wired up (7 of 8
backend agents are unused code), the ranking misses the "availability"
criterion, and the README / agent-trace deliverables are missing. Because
"Agentic Workflow" is **mandatory** and Antigravity + Agentic Reasoning are
**45% of the score**, the agentic gap is the highest-priority risk.

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
| 6 | Show complete reasoning and workflow execution | ⚠️ Partial | Backend logger builds a trace, but it's thin and **not shown in the app** |

**Score: 5 / 6 fully done (83%) — ~92% with partial credit.**

---

## 2. System Requirements (detailed)

| # | Requirement | Status | Notes |
|---|---|---|---|
| 1 | **Intent Understanding** — NL input; Urdu / Roman Urdu / English; extract service, location, time | ✅ Done (100%) | `intentAgent.js` detects `language` (english/roman_urdu/urdu), extracts service/location/time/intentType, replies in the same language, has a keyword guardrail + heuristic fallback. Strong. |
| 2 | **Provider Discovery** — mock dataset or Maps/Places; nearby + category match | ✅ Done (100%) | Firestore mock catalog via `getServices`; category match via `inferCategoryIds`. (Backend `LocationAgent` even has real Nominatim geocoding — but it's unused, see #7.) |
| 3 | **Matching & Ranking** — rank by distance, availability, rating; clear reasoning | ⚠️ Partial (~70%) | `matchingService.js` `rankByMatch` ranks by **rating + distance** only — **availability is not a factor** in the live path. No natural-language "why this provider" reasoning shown. (The unused backend `RankingAgent` *does* include availability + response speed.) |
| 4 | **Decision & Recommendation** — best provider or top options; explain decision simply | ⚠️ Partial (~65%) | Top-3 options are shown ✅. "Explain the decision in simple terms" is weak — cards show rating + km, but no plain-language recommendation reasoning. |
| 5 | **Action Simulation (CRITICAL)** — booking confirmation, provider assignment, scheduling | ✅ Done (100%) | `BookingConfirmationFlow` simulates the booking, writes to Firestore `bookings`, shows a confirmation screen, and sends a real confirmation email. End-to-end and solid. |
| 6 | **Follow-Up Automation** — reminders, status updates, completion confirmation | ✅ Done (~95%) | Reminders ✅ (`reminderService.js` schedules a local `expo-notifications` reminder before the appointment), status updates ✅ (accept/decline emails), completion confirmation ✅ (`completed` email + `markBookingCompleted`). Minor: cross-device reminder cancellation on decline not wired. |
| 7 | **Agentic Workflow (MANDATORY)** — multiple agents / structured pipeline; planning→decision→action→follow-up; traceable logs | ⚠️ Partial (~45%) | **Biggest gap.** 8 agent files exist, but the live `Orchestrator` only runs `IntentAgent`. `Provider/Location/Ranking/Decision/Booking/Followup/Notification` agents are written **but never imported or executed** — effectively dead code. The real pipeline is split: backend does intent only; frontend does matching/booking/follow-up. The trace logger only captures Intent + Orchestrator steps. |

**Score: 4 / 7 fully done (57%) — ~83% with partial credit.**

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
| 3 | Agent Trace / Logs | ⚠️ Partial — backend `logger` returns `logs`, but the trace is thin and the app never displays it. `TRACE_AND_HISTORY.html` may cover this. |
| 4 | Documentation (README) | ❌ Missing — root `README.md` is just "# HackathonProject". Needs architecture, Antigravity usage, APIs/tools, assumptions. |

---

## 5. Evaluation-criteria exposure

| Criterion | Weight | Current standing |
|---|---|---|
| Use of Google Antigravity | 25% | At risk — must be evidenced (traces, README) |
| Agentic Reasoning & Workflow | 20% | Weak — agents not wired into one pipeline |
| Matching Quality & Decision Logic | 20% | Good base — add availability + reasoning text |
| Action Simulation & Execution | 15% | Strong ✅ |
| Technical Implementation | 10% | Decent — but dead/unused backend agents hurt |
| Innovation & UX | 10% | Strong ✅ — polished app |

---

## 6. Critical gaps & recommended fixes (priority order)

1. **Wire the agentic pipeline (MANDATORY, highest impact).** Make the
   `Orchestrator` actually call the chain — `Intent → Provider → Location →
   Ranking → Decision → Booking → Followup → Notification` — so the trace shows
   a real multi-agent flow. Today only `IntentAgent` runs.
2. **Surface the agent trace in the app.** `useChat` already receives
   `result.logs` from the backend but ignores it — show it as a "reasoning /
   workflow" view so the judge can see traceable decision-making.
3. ~~Add reminders (follow-up automation).~~ ✅ **Done (2026-05-21)** —
   `reminderService.js` schedules a local `expo-notifications` reminder before
   the appointment; completion-confirmation email added.
4. **Add `availability` to the ranking** and show a one-line recommendation
   reason ("Closest available provider with a high rating").
5. **Write the README** — architecture, Antigravity usage, tools/APIs,
   assumptions.
6. **Record the demo video** covering the full input→follow-up flow.

---

## 7. Scoring summary

- **Initial Requirements:** 5 / 6 done — **83% strict, ~92% weighted**
- **System Requirements:** 4 / 7 done — **57% strict, ~83% weighted**
- **Deliverables:** 1 / 4 fully done — **~40%**
- **Overall completion vs Challenge 2: ~75%**

The product experience is strong; the **agentic-workflow wiring and the
documentation/trace deliverables** are what stand between ~75% and a
competitive submission.

---

## Progress updates

- **2026-05-21 — Initial Requirement #5 (Handle follow-up interactions) → ✅ Done.**
  Installed `expo-notifications` (SDK 54). Added `src/services/reminderService.js`
  which schedules a local appointment reminder, with a `REMINDER_TEST_SECONDS`
  knob (fires seconds from now) for demoing without waiting an hour. Wired
  reminder scheduling into `saveBookingForUser`, and added a `completed`
  confirmation email (`markBookingCompleted` → `Backend/routes/email.js`).
  System Requirement #6 (Follow-Up Automation) also moved to ✅.
