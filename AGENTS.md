# AGENTS.md

Repo-specific instructions for AI coding agents working on oKane.

## Project

oKane is a local-first personal finance app that runs entirely in the browser and stores all data in IndexedDB: no account, no server, no telemetry. Stack: React 19, TypeScript (strict), Vite, Redux Toolkit, Zod, React Hook Form, React Router, Vitest + React Testing Library. Current `v0.0.x` scope limits: single user, EUR only, Spanish UI. Direction: persistence is planned to move from IndexedDB to SQLite while staying local-first and self-hosted; never assume a hosted backend, an account system or a network dependency.

## Commands

| Command             | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server.                                        |
| `npm run build`     | Production build. Does not typecheck.                             |
| `npm run preview`   | Serve the built output.                                           |
| `npm test`          | Vitest in watch mode. Hangs in CI.                                |
| `npm run lint`      | ESLint over `src` and the Vite/Vitest configs.                    |
| `npm run typecheck` | `tsc` over the app and node projects. The only full typecheck.    |

- `npm test` is watch mode. For a single run use `npx vitest run` or `npm test -- --run`.
- `npm test` and `npm run build` do not typecheck. Run `npm run typecheck` explicitly.
- CI runs lint, typecheck, `npx vitest run` and build on every push to `dev`/`main` and on every pull request.

## Architecture boundaries

Layers, in dependency order:

- `src/core` — entities and invariants, pure domain services, use cases, repository interfaces. No React, no storage.
- `src/adapters` — implementations that talk to the outside world.
- `src/infraestructure` — IndexedDB repositories.
- `src/ui` — React components, pages and the Redux store.

Rules:

- Dependencies point inward: `ui -> core`, never `core -> ui`.
- No React or storage APIs in `src/core`.
- The store never holds a domain entity. `src/ui/store/mappers` is the only place where store state and domain entities meet.
- Do not add a dependency without a real requirement that cannot be met otherwise.

## Conventions

- TypeScript strict. No `any` without a written justification.
- Tests assert behaviour through roles and visible text, not markup. Markup can be reorganised; behaviour cannot change silently.
- Conventional Commits, as described in [CONTRIBUTING.md](CONTRIBUTING.md).
- Branch from `dev` and open PRs into `dev`. `main` is release-only.

## Guardrails

- Never commit `dist/`, `node_modules/`, `.env` files or secrets.
- Never force-push `dev` or `main`, and never rewrite published history.
- Do not change the architecture or add dependencies without asking the maintainer first.
- Update `readme.md` when user-facing behaviour changes.
- Update `BRAND.md` when brand assets change.

## Local, gitignored context

`.atl/`, `openspec/`, `.codegraph/`, `odd/`, `.opencode/` and `.gga` are local tooling and are not part of the product. `docs/` and this file are tracked and shared.
