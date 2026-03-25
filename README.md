# AI Fake News Detector (Credibility Checker)

React + Tailwind frontend and Node/Express backend for analyzing news credibility.

## Features Implemented
- Paste article text/headline, provide URL, or upload screenshot image.
- AI credibility analysis with verdict:
  - `Likely Fake`
  - `Possibly True`
  - `Verified`
- Trust score (`0-100`) with breakdown:
  - Language authenticity
  - Source reliability
  - Fact consistency
- Key claim extraction + explainable summary.
- Source verification with:
  - Supporting articles
  - Contradicting articles

## Project Structure
- `backend/` Express API + OpenAI + source verification logic
- `frontend/` React + Tailwind dashboard/chat-style UI

## Backend API
Base URL: `http://localhost:4000/api`

### `POST /analyze`
Request body:
```json
{
  "text": "optional article text",
  "url": "optional article url",
  "imageDataUrl": "optional base64 data URL"
}
```

Response includes:
- `analysis.verdict`
- `analysis.credibilityScore`
- `analysis.breakdown`
- `analysis.keyClaims`
- `analysis.explanation`
- `verification.supportingArticles`
- `verification.contradictingArticles`

## Environment Variables
Create `backend/.env` from `backend/.env.example`.

Required for full functionality:
- `OPENAI_API_KEY=...`

Optional:
- `OPENAI_MODEL=gpt-4.1-mini`
- `NEWS_API_KEY=...` (for external source verification)
- `PORT=4000`

## Run
### 1) Backend
```bash
cd backend
npm install
npm run dev
```

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` and calls backend at `http://localhost:4000`.

## Notes
- If `OPENAI_API_KEY` is missing, backend returns a safe fallback analysis message.
- If `NEWS_API_KEY` is missing, source verification runs in limited mode.
