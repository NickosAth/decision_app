# Copilot Instructions for Decision App

## Project Overview
Decision App is a bilingual (English/Greek) React + TypeScript + Vite web application that provides AI-powered decision recommendations. The frontend is a React SPA, the backend is an Express.js server that integrates with Groq's LLaMA API for AI decision analysis.

## Architecture

### Frontend (`src/`)
- **Framework**: React 18 + TypeScript + Vite
- **Entry Point**: `main.tsx` → `App.tsx` → `AppLayout.tsx` → `Home.tsx`
- **Core Engine**: `src/decision-engine/engine.ts` exports two decision functions:
  - `runDecision()` - Local fallback with hardcoded recommendations
  - `runDecisionAI()` - Calls backend API at `http://localhost:5000/api/decision`
- **State Management**: React hooks (useState, useEffect) in Home component
- **Storage**: Browser localStorage with key `decision_history`

### Backend (`server/`)
- **Framework**: Express.js with TypeScript
- **Port**: 5000 (configured in `server.ts`)
- **API Endpoint**: `POST /api/decision` accepts `{text, category, risk, lang}`
- **AI Provider**: Groq API (llama-3.3-70b-versatile model)
- **API Key**: `GROQ_API_KEY` from `.env` file
- **Response Format**: JSON with `{recommendation, explanation, score, confidence}`
- **Note**: Server currently runs from compiled `server.js` (not ts-node) - use `node server.js`

## Data Flow & Key Integration Points

1. **User Input** → Home component collects text, category (social/career/personal), risk level (low/medium/high), language (en/el)
2. **Decision Processing** → `runDecisionAI()` sends POST to `/api/decision`
3. **AI Analysis** → Server sends prompt to Groq LLaMA API with context about decision type and risk
4. **Fallback Logic** → If AI fails (network/API error), automatically uses `runDecision()` local fallback
5. **History Persistence** → Each decision saved to localStorage with `StoredDecision` interface (input, result, date, language)
6. **Export Feature** → Generates formatted TXT file of decision history

## TypeScript Types (Critical)
Located in `src/decision-engine/types.ts`:
- `RiskLevel = "low" | "medium" | "high"`
- `Category = "social" | "career" | "personal"`
- `DecisionInput` - user's question and metadata
- `DecisionResult` - AI recommendation output
- `StoredDecision` - localStorage entry with timestamp

## Critical Patterns & Conventions

### i18n Approach
Hardcoded translation maps for "en" and "el" (not i18next). Look for pattern:
```typescript
const labels = {
  en: { social: "social", career: "career", personal: "personal" },
  el: { social: "κοινωνικό", career: "καριέρα", personal: "προσωπικό" }
};
```

### Bilingual AI Prompts
Server constructs different prompts in `server.ts` depending on `lang` parameter. Greek prompts explicitly warn the AI: "If the question includes negative consequences, understand the user does NOT want that - it's a risk to avoid."

### localStorage Key
Always use `"decision_history"` - changing this breaks history persistence.

### Theme Toggle
Uses `data-theme="light"|"dark"` attribute on `document.documentElement` - CSS handles actual theme via CSS variables in `index.css`.

### Auto-dismiss Results
Decision results auto-dismiss after 10 seconds (setTimeout in Home.tsx).

## Build & Development

### Frontend
```bash
npm run dev      # Start Vite dev server on :5173
npm run build    # TypeScript + Vite build → dist/
npm run lint     # ESLint check
```

### Backend
```bash
cd server
node server.js   # Run compiled version (preferred over ts-node)
npm start        # Alternative: ts-node server.ts
```

**Important**: Both frontend AND backend must run simultaneously. Frontend makes fetch calls to `http://localhost:5000`.

### Environment Setup
`server/.env` must contain `GROQ_API_KEY=your_key_here`. Git ignores this file.

## Common Patterns to Follow

### Error Handling
- API errors are caught and logged, triggering fallback to `runDecision()`
- JSON parsing errors from AI response logged as warnings, return 500 error
- Frontend shows no error UI - silently falls back (logged in console)

### Response Validation
Server regex-matches for JSON in AI response: `/\{[\s\S]*\}/`. If Groq returns text before/after JSON, extraction still works.

### Component Props
Minimal prop drilling - Home component handles most state. AppLayout accepts `children` ReactNode, passes through to page components.

### CSS
Single file (`src/index.css`) with CSS variables for theming. No CSS-in-JS or component libraries (plain CSS).

## File Modification Guidelines

- **Server changes**: Compile TypeScript after edits (`npm run build` in root), or restart `node server.js`
- **Frontend changes**: Vite auto-reloads in dev mode
- **Type changes**: Update both `.ts` and `.js` versions if they exist (legacy JS files present)
- **i18n**: Always add translations for both "en" and "el" keys simultaneously

## Known Quirks & Technical Debt

1. **Duplicate files**: `.ts` and `.js` versions exist in src/ and server/ (legacy). Maintain both during migration.
2. **TypeScript config split**: `tsconfig.json` (shared), `tsconfig.app.json` (frontend), `tsconfig.node.json` (build tools)
3. **Server package.json type**: `"type": "commonjs"` (not ESM like frontend), uses require-based config
4. **No API error responses to UI**: Failures silently use fallback - consider adding error toast in future
5. **localStorage no size management**: Decision history can grow unbounded; consider pagination/archival

## Testing & Validation

- No test suite currently configured
- Manual testing: Use Groq API key valid, check browser console for AI failures
- Lint: `npm run lint` (ESLint) - check before committing

## Next Steps for New Features

1. Add new category/risk level → Update types.ts, add i18n translations in both engine.ts + server.ts
2. Extend AI prompt logic → Modify `server.ts` prompt template (separate en/el)
3. Add UI features → Stay in Home.tsx (no component library), update CSS in index.css
4. Add backend endpoint → Express routes in server.ts, ensure CORS enabled
