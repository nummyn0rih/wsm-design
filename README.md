# WSM — Warehouse Shipment Manager

Phase 1 prototype of WSM. Stack: Vite + React 18 + TypeScript (strict) + react-router-dom 6, LocalStorage persistence, no UI library, sketch-style CSS.

> **Status**: M1 (project setup). Domain types, repos, services, UI screens land in M2+. See [`docs/TASKS.md`](docs/TASKS.md).

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run typecheck` | `tsc --noEmit` (TS strict) |
| `npm run lint` | ESLint over `.ts`/`.tsx` |
| `npm run format` | Prettier write |
| `npm run test` | Vitest run (unit, jsdom) |
| `npm run test:watch` | Vitest watch |

## Docs

- [`CLAUDE.md`](CLAUDE.md) — operational rules for Claude Code sessions.
- [`docs/PRD.md`](docs/PRD.md) — product scope.
- [`docs/DOMAIN.md`](docs/DOMAIN.md) — domain model, roles, permissions.
- [`docs/IMPLEMENTATION.md`](docs/IMPLEMENTATION.md) — architecture, folder structure.
- [`docs/DESIGN.md`](docs/DESIGN.md) — visual rules.
- [`docs/ACCEPTANCE.md`](docs/ACCEPTANCE.md) — Phase 1 acceptance.
- [`docs/TASKS.md`](docs/TASKS.md) — milestone backlog.

## Project layout (M1)

```
src/
  main.tsx           bootstrap
  App.tsx            layout shell (Outlet)
  router.tsx         createBrowserRouter
  styles/            tokens + sketch + global skeletons
  types/             (M2)
  lib/               (M2)
  services/          (M3)
  repos/             (M4)
  context/           (M5)
  data/seed/         (M4)
  components/        (M5+)
```
