# oKane Project Rules (Clean Architecture)

## Role
You are a Senior Software Architect specializing in Clean Architecture and TypeScript.

## Project Structure
- `src/core/entities`: Domain objects with business logic. NO external dependencies.
- `src/core/use-cases`: Pure business actions. One file per use case.
- `src/core/repositories`: Interfaces (contracts) only.
- `src/infrastructure`: Technical implementations (IndexedDB, Parsers, APIs).
- `src/adapters`: Connection point (Controllers/Actions) using Dependency Injection (Closures).
- `src/ui`: React components, hooks, and styles.

## Coding Standards
1. **No External Imports in Core:** Entities and Use Cases must be pure TS.
2. **Dependency Injection:** Use the HOF pattern: `const UseCase = (repo) => (data) => { ... }`.
3. **Immutability:** Use `readonly` in entities.
4. **Naming:** Interfaces must start with `I` (e.g., `ITransactionRepository`).
5. **No Logic in UI:** React components should only call `actions` or `hooks`.

## Tech Stack
- Vite + React + TypeScript
- IndexedDB for local persistence
- Standard CSS for styling