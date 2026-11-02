# oKane

A local-first personal finance app. Your transactions never leave your browser.

oKane runs entirely in the browser and stores everything in IndexedDB: no account, no server, no telemetry. It started as a tool I needed to understand my own spending, and it is also the project where I practise the stack I want to work in.

## What it does

- **Transactions** — create, edit and delete movements, with a paginated table.
- **Categories** — manage the category list used across the app.
- **CSV import** — map the columns of a bank export, validate every row, and see what was imported, skipped or failed.
- **Categorization rules** — rules that assign a category from the description, applied to existing transactions or while importing.
- **Monthly overview** — spending by category for a calendar month, with uncategorized amounts shown explicitly instead of hidden inside a total.

## Stack

React 19 · TypeScript (strict) · Vite · Redux Toolkit · IndexedDB · Zod · React Hook Form · React Router · Vitest + React Testing Library.

## Getting started

```bash
git clone https://github.com/TonyHermann/oKane.git
cd oKane
npm install
npm run dev
```

Other scripts:

```bash
npm run build      # production build
npm run preview    # serve the build
npm test           # tests in watch mode
npx vitest run     # tests, single run
npm run typecheck  # tsc over both projects
npm run lint       # eslint
```

`npm test` and `npm run build` do **not** typecheck. `npm run typecheck` is the only command that runs `tsc` over the whole project.

## Architecture

Layers, in dependency order:

| Layer | Responsibility |
| --- | --- |
| `src/core` | Entities and their invariants, pure domain services, use cases, repository interfaces. No React, no storage. |
| `src/adapters` | Implementations that talk to the outside world. |
| `src/infraestructure` | IndexedDB repositories. |
| `src/ui` | React components, pages and the Redux store. |

Three decisions shape the rest:

- **Offline-first, not offline-fallback.** Persistence is the source of truth, not a cache in front of an API. There is no API to fall back to.
- **The store never holds a domain entity.** Redux slices hold plain state objects; `src/ui/store/mappers` is the only place where store state and domain entities meet, and it is where invariants are re-applied.
- **No charting library.** The first overview uses a native table and CSS. A dependency gets added when a real requirement can no longer be met, not before.

## Tests

134 tests across 28 files: domain services and entities, Redux slices with their async thunks, and component behaviour through React Testing Library. Component tests query by role and visible text, so they fail when behaviour changes, not when markup is reorganised.

## Status

Early but usable. `v0.0.x`: single user, single currency (EUR), Spanish UI. Not there yet: budgets, recurring transactions, multi-currency, charts beyond native tables.

## Third-party assets

XP.css (MIT) and the Asar typeface (SIL OFL 1.1) are bundled in this repository; the app makes no requests to third-party origins. See [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

## License

MIT — see [LICENSE](LICENSE).
