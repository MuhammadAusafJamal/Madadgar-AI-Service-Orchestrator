# Madadgar — AI Service Orchestrator for the Informal Economy

> **Google Antigravity Hackathon — Challenge 2**

**Madadgar** is an agentic AI system that automates the entire lifecycle of a
home-service request — from a natural-language message
(_"Mujhe kal subah G-13 mein AC technician chahiye"_) to a matched provider, a
simulated booking, and automated follow-up — driven by a multi-agent workflow
with a fully traceable reasoning log.

> **📹 Demo video:** _‹paste your demo video link here›_

---

## What it does

- **Natural-language intake** — understands service requests in **English,
  Roman Urdu, and Urdu**.
- **Intent extraction** — pulls out the service type, location, and time.
- **Provider matching & ranking** — ranks providers on a weighted blend of
  **rating + availability + distance**, and recommends the best one.
- **Simulated booking** — end-to-end booking confirmation with a confirmation
  email to the customer and the provider.
- **Follow-up automation** — appointment reminders (local notifications),
  status updates, and a completion email.
- **Traceable agentic workflow** — every request runs an 8-agent pipeline; the
  reasoning and the raw agent log are visible inside the app.

---

## Architecture

The system has two parts — a React Native app and an Express backend — with
Firebase as the shared data layer.

```
┌─────────────────────┐    POST /api/orchestration/chat   ┌──────────────────────┐
│  Mobile App (Expo)  │ ────────────────────────────────► │  Backend (Express)   │
│                     │                                    │                      │
│  • Chat UI          │ ◄──── intent + reply + agent ───── │  Orchestrator        │
│  • Matching/Booking │         trace (logs)               │   └─ 8-agent pipeline│
│  • Reasoning sheet  │                                    │                      │
└──────────┬──────────┘                                    │  POST /api/email     │
           │                                               │   (Brevo SMTP)       │
           │  Firestore                                    └──────────────────────┘
           ▼  (services, providers, bookings, reviews, favourites)
     ┌─────────────┐
     │  Firebase   │  Authentication + Firestore
     └─────────────┘
```

Each chat message is sent to the backend **Orchestrator**, which runs the
multi-agent pipeline and returns the extracted intent, a reply, and the full
**agent trace**. The app then matches the real Firestore catalog, lets the user
book, and handles follow-up automation on-device.

---

## The agentic pipeline

When a request has a complete intent (service + location + time), the
`Orchestrator` runs all 8 agents in sequence — **planning → decision → action →
follow-up** — each logging to a shared trace:

| # | Agent | Role |
|---|---|---|
| 1 | **Intent Agent** | Extracts service / location / time / language from natural language (Gemini) |
| 2 | **Location Agent** | Geocodes the address (OpenStreetMap / Nominatim) |
| 3 | **Provider Agent** | Discovers candidate providers for the service |
| 4 | **Ranking Agent** | Scores providers by rating + availability + distance |
| 5 | **Decision Agent** | Selects the best provider |
| 6 | **Booking Agent** | Simulates the booking |
| 7 | **Follow-up Agent** | Schedules the post-service reminder |
| 8 | **Notification Agent** | Sends the confirmation |

The full trace is surfaced in the app under **"How I worked this out"** — a
friendly **Steps** view plus a raw **Agent Log** (agent, message, timestamp,
data).

---

## Tech stack & APIs

| Area | Technology |
|---|---|
| Mobile app | Expo SDK 54, React Native 0.81, Expo Router, Reanimated, `expo-notifications` |
| Backend | Node.js + Express (ES modules) |
| AI / LLM | Google **Gemini** via `@google/genai` (`gemini-2.5-flash`) |
| Data & Auth | Firebase — Firestore + Authentication |
| Geocoding | OpenStreetMap **Nominatim** (free, no key) |
| Email | **Brevo** SMTP via Nodemailer |
| Media uploads | Cloudinary |

---

## How Google Antigravity is used

Google Antigravity is the core agentic development platform behind this project:

- **Workflow orchestration & planning** — the multi-agent pipeline
  (`Backend/workflows/orchestrator.js`) and the role of each of the 8 agents
  were designed and iterated within Antigravity.
- **Task planning & execution** — Antigravity's workplan / task system drove
  the step-by-step implementation of each agent, feature, and fix.
- **Reasoning & traceability** — Antigravity's agent traces guided the
  structured, logged reasoning that the app now exposes in its Agent Log.
- **Artifacts** — `TRACE_AND_HISTORY.html` and `CHANGES_SUMMARY.html` (repo
  root) are exported Antigravity workplan / trace records.

---

## Project structure

```
Madadgar-AI-Service-Orchestrator/
├─ Frontend/                Expo React Native app
│  ├─ app/                  expo-router routes (tabs, auth, service, chat)
│  └─ src/
│     ├─ screens/           UI screens
│     ├─ components/        shared components
│     ├─ hooks/             useChat, useProviderDashboard, …
│     ├─ services/          matching, booking, reminders, seed, Firebase
│     └─ context/           Auth, Favourites
├─ Backend/                 Express API
│  ├─ agents/               the 8 agents (intent, location, provider, …)
│  ├─ workflows/            orchestrator.js — runs the agent pipeline
│  ├─ routes/               orchestration, email
│  └─ utils/                distance, email, logger
└─ README.md
```

---

## Setup & run

### Backend

```bash
cd Backend
npm install
npm run dev          # starts on PORT (default 5000)
```

`Backend/.env`:

```
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash        # optional
PORT=5000                            # optional

# Email (Brevo SMTP) — optional; if unset, emails are skipped (logged)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-login
SMTP_PASS=your-brevo-smtp-key
EMAIL_SENDER_NAME=Madadgar
EMAIL_SENDER_ADDRESS=your-verified-sender@example.com
```

### Frontend

```bash
cd Frontend
npm install
npx expo start
```

`Frontend/.env`:

```
EXPO_PUBLIC_API_URL=http://<your-backend-host>:5000

EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...

EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=...
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
```

After first launch, seed the demo catalog: open the app → **Profile → Reseed
Demo Data**.

---

## Assumptions & limitations

- **Mock catalog** — providers and services are seeded demo data in Firestore.
- **Simulated booking & availability** — bookings and each provider's
  `availability` are simulated, in line with the challenge's "use mock data"
  guidance.
- **Agent pipeline (approach B)** — the backend 8-agent pipeline runs to produce
  the traceable multi-agent workflow; the actual booking is written to Firestore
  by the client.
- **Reminders are local** — appointment reminders use on-device notifications
  scheduled on the customer's device. A `REMINDER_TEST_SECONDS` knob makes them
  fire within seconds for demos.
- **Email** — requires Brevo SMTP credentials; without them, sends are skipped
  (and logged) and the rest of the app works normally.
- **Geocoding** — Nominatim has a light rate limit, which is sufficient for
  demo-scale usage.
