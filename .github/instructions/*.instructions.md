# Copilot Instructions for `copilot-ts-workshop-two`

These instructions orient AI coding agents to be productive immediately in this repo. Focus on concrete workflows and project-specific patterns. Keep changes minimal and consistent with the existing codebase.

## Code Review Guidelines

When reviewing code, consider the following best practices:
1) When reviewing API code:
- Ensure that all endpoints have proper authentication and authorization checks.
- Validate all inputs to prevent injection attacks and other vulnerabilities.
- Check for proper error handling and logging to avoid exposing sensitive information.
- Suggest improvements to enhance security, performance, and maintainability.
2) When reviewing frontend code:
- Ensure that the UI is responsive and accessible.
- Validate that all user inputs are properly sanitized and validated.
- Check for proper state management and data flow.
3) When reviewing tests:
- Ensure that tests cover all critical paths and edge cases.
- Validate that tests are isolated and do not depend on external systems.
- Suggest improvements to enhance test reliability and maintainability.

## Architecture Overview
- **Monorepo structure:** Three independent apps under the root.
    - `backend/`: Express + TypeScript API serving superheroes data from `backend/data/superheroes.json`.
    - `frontend/`: React app (CRA) on port `3001` with a **comparison UI** workflow: login screen → table selection → comparison view.
    - `mcp/`: Model Context Protocol server exposing `get_superhero` tool for AI agent integration via stdio transport.
- **Data flow:**
    - Backend reads JSON from disk (no DB) via `fs.readFile` in `src/server.ts` and exposes endpoints under `/api/superheroes`.
    - Frontend fetches from backend (implicit via CRA `proxy: http://localhost:3000`) and renders a login → table → comparison flow.
    - MCP server loads a separate copy of superheroes data (`mcp/data/superheroes.json`) and formats responses as markdown for AI consumption.

## Backend API
- **Server file:** `backend/src/server.ts` (ESM). Uses `__dirname` via `fileURLToPath`.
- **Port selection:** `PORT = process.env.TEST_PORT || process.env.PORT || 3000`.
- **Endpoints:**
    - `GET /` → health string: "Save the World!"
    - `GET /api/superheroes` → array of heroes.
    - `GET /api/superheroes/:id` → single hero object or `404`.
    - `GET /api/superheroes/:id/powerstats` → powerstats or `404`.
    - `GET /api/superheroes/compare?id1=X&id2=Y` → comparison result with `{ id1, id2, categories: [{ name, winner, id1_value, id2_value }], overall_winner }`.
- **Winner calculation:** Compare six stats (`intelligence`, `strength`, `speed`, `durability`, `power`, `combat`) in order; winner is hero with most category wins (or `'tie'`).
- **Error handling:** Returns `500` on read/parse failures; startup handles `EADDRINUSE`/`EACCES` and exits non-test.
- **Data path:** `backend/data/superheroes.json` relative to `server.ts` using `path.join(__dirname, '../data/superheroes.json')`.

## Backend Dev/Test Workflow
- **Start dev server:** `cd backend && npm install && npm run dev` (nodemon + tsx).
- **Run once:** `npm run start`.
- **Tests:** Jest + SuperTest via ESM runner.
    - Run: `npm test`.
    - `server.test.ts` uses `request(app)` without starting a listener; sets `TEST_PORT=3002` for safety.
    - Tests also mock the route handler for error-path assertions by accessing `app._router.stack`.
- **Conventions:** Keep routes under `/api/superheroes*`. Maintain ESM semantics; avoid using CommonJS `__dirname` directly.

## Frontend Dev/Test Workflow
- **Start dev server:** `cd frontend && npm install && npm run start` (CRA on `PORT=3001`).
- **Proxy:** CRA `proxy` points to `http://localhost:3000` for backend API.
- **UI Flow:** `Login` component (no real auth) → `App` component with table view → comparison view.
    - **Table view:** Displays all heroes; select up to 2 with checkboxes (third selection replaces first). Compare button enables when 2 selected.
    - **Comparison view:** Shows hero cards, VS section, stat-by-stat comparison (highlighting winners), and final result (winner or tie with score format `X-Y`).
    - Backend `/api/superheroes/compare` fetches authoritative comparison; frontend computes local result first for immediate UI responsiveness.
- **Playwright tests:** 132+ tests across 13 files covering functionality, accessibility, responsive design, visual effects, data validation, edge cases.
    - Run: `npx playwright test` from `frontend` (ensure server at `:3001` is running).
    - Config: `playwright.config.ts` uses `baseURL: http://localhost:3001` and Chromium by default.
    - Test organization: `tests/*.spec.ts` with detailed documentation in `tests/TEST_DOCUMENTATION.md` and `tests/README.md`.
    - Key test files: `sanity.spec.ts` (smoke tests), `superhero-table.spec.ts`, `hero-selection.spec.ts`, `comparison-view.spec.ts`, `winner-calculation.spec.ts`, `accessibility.spec.ts`, `responsive-design.spec.ts`, `visual-effects.spec.ts`.
- **Conventions:** Use CRA defaults (`react-scripts`). No real authentication. All backend fetches use `/api/superheroes` paths (rely on CRA proxy). CSS classes for visual feedback: `.selected-row`, `.winner`, `.comparison-view`, `.hero-card`.

## MCP Utility
- **Package:** `mcp/package.json` with `type: module`, `build` script compiles TypeScript to `build/`.
- **Purpose:** Model Context Protocol server exposing `get_superhero` tool for AI agent integration via stdio transport.
- **Tool:** `get_superhero({ name?, id? })` returns markdown-formatted superhero data with image and powerstats.
- **CLI:** `bin: mcp -> build/index.js` (ensure executable via `chmod 755`). Configure in `.vscode/mcp.json` or similar MCP client config.
- **Test script:** `mcp/tests/test-mcp.js` reads `mcp/data/superheroes.json` and prints markdown-like output. Run via `node mcp/tests/test-mcp.js`.
- **Conventions:** Keep MCP data and backend data in sync only when explicitly needed—they are separate copies.

## Patterns & Conventions
- **ESM everywhere:** Backend and MCP use ESM; prefer `import`/`export`, `fileURLToPath` for `__dirname`, no `require`.
- **JSON data model:** Heroes objects include `id`, `name`, `image`, and `powerstats` with keys: `intelligence`, `strength`, `speed`, `durability`, `power`, `combat`.
- **Error surfaces:** On backend failures, return `500` strings; do not leak internal errors.
- **Testing style:** API tests use SuperTest directly on `app` without opening a port; prefer route handler mocking via `app._router.stack` for error-paths.
- **Ports & proxy:** Frontend `3001` → backend `3000`. Do not change unless coordinated across both.

## Common Tasks (Examples)
- **Add a new backend endpoint:**
    - Extend `server.ts` under `/api/superheroes` namespace.
    - Read from the same JSON via `loadSuperheroes()`; return consistent shapes and statuses.
    - Add tests in `backend/tests/server.test.ts` with SuperTest.
- **Frontend consuming API:**
    - Fetch `/api/superheroes` from the React app; rely on CRA `proxy` (no hard-coded `localhost:3000`).
    - Keep UI simple; tests should still find "superheroes" text in the page.
- **MCP data inspection:**
    - Use `mcp/tests/test-mcp.js` for quick validation; update `mcp/data/superheroes.json` if you add fields used by MCP.

## Integration Notes
- **Cross-component alignment:** If you change the data schema in backend, reflect similar changes in MCP data only if MCP scripts consume them.
- **ESM + Jest:** Jest runs via `node --experimental-vm-modules`; keep TypeScript/Jest configs stable and avoid CommonJS shims.

## Run Commands (macOS zsh)
```zsh
# Backend
cd backend
npm install
npm run dev  # or: npm start
npm test

# Frontend (in a second terminal)
cd ../frontend
npm install
npm run start
npx playwright test  # ensure server at :3001 is running

# MCP
cd ../mcp
npm install
npm run build
node tests/test-mcp.js
```

## When Updating This File
- Keep instructions concise and codebase-specific; avoid generic advice.
- Preserve endpoint paths, port behavior, and ESM conventions.
- Reference exact files: `backend/src/server.ts`, `backend/tests/server.test.ts`, `frontend/tests/sanity.spec.ts`, `mcp/tests/test-mcp.js`.
