# Conversation Log

> Created as `conversation.md` (the request mentioned `conversation.mc`, which is
> assumed to be a typo for the standard Markdown extension).

---

## Request

**User:** I want to deploy this directory to Vercel — add the required configuration.
Also add a `conversation.mc` file and record our conversation accordingly.

---

## What was done

The `Backend` directory is an Express.js (ESM) API. Vercel runs apps as serverless
functions, so the app was restructured to work both locally and on Vercel without
changing any business logic.

### Files added / changed

| File | Purpose |
|------|---------|
| `app.js` *(new)* | Builds and exports the Express app (no `app.listen`). Single source of truth for routes and middleware. Added a `GET /` health check. |
| `server.js` *(changed)* | Now just imports `app.js` and calls `app.listen` — used for local development only. |
| `api/index.js` *(new)* | Vercel serverless entry point. Exports the Express app as the default handler. |
| `vercel.json` *(new)* | Routes every incoming request to `api/index` via `rewrites`. |
| `.vercelignore` *(new)* | Keeps `node_modules`, `.env`, test scripts, etc. out of the deployment. |
| `.env.example` *(new)* | Documents every environment variable the app reads. |
| `package.json` *(changed)* | Added `"engines": { "node": "20.x" }`. |

### Why this structure

- An Express `app` is itself a `(req, res)` handler, so `api/index.js` can export
  it directly — Vercel's `@vercel/node` runtime invokes it per request.
- `app.listen()` must **not** run in a serverless environment; it now lives only
  in `server.js` for local use.
- Vercel auto-detects files under `api/` as serverless functions; the `rewrites`
  rule forwards all paths (e.g. `/api/orchestration/chat`) to that single function,
  and the original URL is preserved so Express route matching still works.

### Notes

- `firebase-admin` is a dependency but its usage is commented out, so no service
  account credentials are required at runtime.
- Environment variables in use: `PORT`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`,
  `OPENROUTER_MODEL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
  `EMAIL_SENDER_ADDRESS`, `EMAIL_SENDER_NAME`, `N8N_WEBHOOK_URL`.

---

## Deploy steps

1. Install the CLI: `npm i -g vercel`
2. From the `Backend` directory, run `vercel` (preview) or `vercel --prod`.
3. In the Vercel dashboard, add the environment variables from `.env.example`
   under **Project Settings → Environment Variables**.
4. Endpoints after deploy:
   - `GET  /` — health check
   - `POST /api/orchestration/chat`
   - `POST /api/email/...`
