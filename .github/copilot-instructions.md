# Copilot Instructions

## Project Overview

Superhero comparison app with three components:
- **Backend** (`backend/`): Express TypeScript API serving superhero data from JSON on port 3000
- **Frontend** (`frontend/`): React app with hero selection/comparison UI on port 3001
- **MCP** (`mcp/`): Model Context Protocol server (stub implementation)

Data source: `data/superheroes.json` in both backend/ and mcp/ directories.

## Critical Workflows

### Running the Application

**Backend:**
```bash
cd backend
npm run dev          # Development with nodemon
npm start            # Production
npm test             # Jest unit tests
```

**Frontend:**
```bash
cd frontend
npm start            # Starts on port 3001
npx playwright test  # E2E tests (requires backend running on 3000)
```

**Port Configuration:**
- Backend: 3000 (configurable via `PORT` env var)
- Frontend: 3001 (hardcoded via `cross-env PORT=3001`)
- Frontend proxies `/api/*` requests to `localhost:3000`
- Tests: Backend unit tests use port 3002 via `TEST_PORT`

### Testing Strategy

**Backend** (Jest + Supertest):
- Unit tests in `backend/tests/server.test.ts`
- Sets `NODE_ENV=test` to prevent server from listening
- Uses `process.env.TEST_PORT = '3002'` to avoid port conflicts

**Frontend** (Playwright):
- E2E tests in `frontend/tests/*.spec.ts`
- Requires **both** servers running (backend on 3000, frontend on 3001)
- Tests navigate to `http://localhost:3001` (configured in `playwright.config.ts`)
- Test categories: API integration, hero selection, hero comparison, winner calculation, sanity

## Architecture Patterns

### ESM Module Setup

Both backend and mcp use ES modules (`"type": "module"` in package.json):
- Use `import`/`export` syntax
- Get `__dirname` via: `path.dirname(fileURLToPath(import.meta.url))`
- Jest configured for ESM with `ts-jest/presets/default-esm`

### API Structure

Three REST endpoints (backend):
```typescript
GET /                              // Health check: "Save the World!"
GET /api/superheroes              // Returns all heroes array
GET /api/superheroes/:id          // Returns single hero object
GET /api/superheroes/:id/powerstats // Returns powerstats object only
```

**Error Handling:** Returns 404 for missing heroes, 500 for server errors. Backend exports app without starting server when `NODE_ENV=test`.

### Frontend Data Flow

1. App fetches `/api/superheroes` on mount
2. User selects 2 heroes via checkboxes (stored in `selectedHeroes` state)
3. "Compare Heroes" button switches view to comparison mode
4. Winner calculation: Compares 6 powerstats (intelligence, strength, speed, durability, power, combat), awards point per stat win

**View States:** `currentView` toggles between `'table'` (hero list) and `'comparison'` (side-by-side comparison with winner).

## Project-Specific Conventions

### TypeScript Configuration

- Backend uses `tsx` for development execution (not `ts-node`)
- Frontend uses standard `react-scripts` (no TypeScript, just `.js` files)
- Playwright tests are TypeScript (`.spec.ts`)

### Data Consistency

Superhero JSON must exist in **both** `backend/data/` and `mcp/data/` with identical structure:
```json
[
  {
    "id": 1,
    "name": "A-Bomb",
    "powerstats": { "intelligence": 38, "strength": 100, ... },
    "image": "https://..."
  }
]
```

### Test Assumptions

- Playwright tests assume specific hero IDs exist: A-Bomb (id: 1), Ant-Man (id: 2)
- API integration tests expect at least 3 heroes in dataset
- Tests reference heroes by array position (`.nth(0)`, `.nth(1)`)

## Integration Points

**Frontend ↔ Backend:**
- Frontend proxies API calls via `"proxy": "http://localhost:3000"` in package.json
- Playwright tests intercept network requests via `page.waitForResponse()` to verify API integration
- No authentication/authorization implemented

**Skills Integration:**
- `.github/skills/api-security-review/SKILL.md` provides security review checklist for API changes
- Triggered for authentication, authorization, input validation, rate limiting, and logging changes

## Common Pitfalls

1. **Port conflicts:** Kill existing processes on 3000/3001 before running servers
2. **Test failures:** Playwright tests fail if backend isn't running on port 3000
3. **ESM imports:** Don't forget `.js` extensions in relative imports when using Jest with ESM
4. **Server in tests:** Backend must export `app` without calling `listen()` when `NODE_ENV=test`
