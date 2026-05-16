# AI Service Orchestrator for Informal Economy

An AI-driven multi-agent orchestration system for discovering, ranking, and booking informal service providers (plumbers, AC technicians, etc.) in Pakistan.

## Architecture

This project is divided into:
1. **Frontend**: React Native Expo app that functions as the AI assistant interface.
2. **Backend**: Node.js + Express server coordinating multiple AI agents.

### Agents
- **Intent Agent**: Uses Google Gemini to extract service category, location, and time.
- **Location Agent**: Uses Nominatim API to geocode text locations into Coordinates.
- **Provider Agent**: Fetches nearby mocked providers based on the service category.
- **Ranking Agent**: Calculates provider scores using Haversine distance, rating, speed, and availability.
- **Decision Agent**: Autonomously selects the best provider from the ranked list.
- **Booking Agent**: Simulates the creation of a booking.
- **Notification Agent**: Triggers webhooks (e.g., n8n) for automated email/SMS.
- **Follow-up Agent**: Schedules delayed tasks for obtaining feedback.
- **Orchestrator Agent**: Manages the pipeline sequentially and collects reasoning logs.

## Setup Instructions

### 1. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
- Edit \`backend/.env\` and add your \`GEMINI_API_KEY\`.
- Start the server:
\`\`\`bash
npm run dev
\`\`\`

### 2. Frontend Setup
\`\`\`bash
cd frontend
npm install
\`\`\`
- Start the Expo app:
\`\`\`bash
npm start
\`\`\`

## N8N Automation
To configure n8n, create a workflow starting with a Webhook node listening on \`POST /webhook/booking-notification\`. Update the \`N8N_WEBHOOK_URL\` in \`backend/.env\`.
