# Copilot Instructions

## Project Overview
Full-stack superhero comparison app with three components: Express/TypeScript backend API, React frontend, and Model Context Protocol (MCP) server. All components share `data/superheroes.json` as the single source of truth.

## Architecture

### Three-Tier Structure
- **Backend** (`backend/`): Express server on port 3000 (or `TEST_PORT=3002` in tests)
- **Frontend** (`frontend/`): React app on port 3001, proxies API calls to backend
- **MCP Server** (`mcp/`): Standalone MCP server for external tool integration

### Data Flow
1. Frontend fetches from `/api/superheroes` → backend reads `data/superheroes.json`
2. User selects 2 heroes → frontend calculates winner client-side using powerstats
3. Winner determined by comparing 6 stats (intelligence, strength, speed, durability, power, combat) - most category wins decides victor

## Key Conventions

### Port Management
- Backend uses `process.env.TEST_PORT || process.env.PORT || 3000`
- Frontend hardcoded to port 3001 via `cross-env PORT=3001`
- Tests MUST set `process.env.TEST_PORT = '3002'` before importing server

### Module System
- Backend and MCP: ES modules (`"type": "module"` in package.json)
- Use `tsx` for TypeScript execution, not `ts-node`
- Backend imports require `.js` extensions in TS files despite writing `.ts`
- Frontend: CRA default (not ES modules)

### Testing Strategy
- **Backend**: Jest + Supertest, config in `jest.config.cjs` with ESM support
- **Frontend**: Playwright for E2E, targets `http://localhost:3001`, uses page object selectors like `.hero-card`, `.stat-value.winner`
- Run backend tests: `npm test` (uses `node --experimental-vm-modules`)
- Run frontend tests: `npx playwright test` (assumes servers already running)

### API Patterns
All backend routes follow this structure:
```typescript
app.get('/api/endpoint', async (req, res) => {
  try {
    const data = await loadSuperheroes();
    // ... logic
    res.json(result);
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});
```

Three endpoints:
- `GET /api/superheroes` - returns full array
- `GET /api/superheroes/:id` - returns single hero, 404 if not found
- `GET /api/superheroes/:id/powerstats` - returns powerstats object only

## Development Workflow

### Starting Services
```bash
# Backend (from backend/)
npm run dev              # nodemon with tsx

# Frontend (from frontend/)
npm start                # Starts on port 3001

# Tests
cd backend && npm test
cd frontend && npx playwright test
```

### MCP Server
- Build first: `npm run build` (compiles to `build/index.js`)
- Register in `mcp.json` with path to built file
- Empty implementation in `src/index.ts` - placeholder for workshop

### Common Gotchas
- Backend server conditionally starts only if `NODE_ENV !== 'test'` to avoid port conflicts in tests
- Frontend comparison logic is entirely client-side - backend just serves data
- Playwright tests assume both servers already running (no auto-start)
- ESM + Jest requires `--experimental-vm-modules` flag and special jest.config.cjs

## File Locations
- Superhero data: `{backend,mcp}/data/superheroes.json` (duplicated)
- Backend entry: `backend/src/server.ts` (default export for testing)
- Frontend entry: `frontend/src/App.js` (single component, no routing)
- Playwright tests: `frontend/tests/*.spec.ts` (organized by feature)
