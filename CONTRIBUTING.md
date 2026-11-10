# Contributing to oKane

oKane is a solo project, but it uses the same conventions as a team repository: the goal is a history that stays readable and reversible months later, and changes that can be reviewed, reverted or replayed without guesswork.

## Branch model

`main` is release-only. It never receives direct commits; it only moves when a release is cut.

`dev` is the integration trunk. All work happens in short-lived branches cut from `dev` and merged back into `dev` through a pull request.

```
feat/x -> PR -> dev -> release -> main + tag
```

- Never force-push `dev` or `main`.
- Never open feature branches against `main`.
- `main` must always be a state that was verified on `dev` first.

## Branch naming

Format: `<type>/<short-slug>`, kebab-case, at most around five words.

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `style`.

Examples:

```
feat/category-rules-editor
fix/pagination-off-by-one
refactor/movement-mappers
```

Delete the branch after merge:

```bash
git branch -d <branch>
git push origin --delete <branch>
```

No branch should live longer than a few days. If it does, the change is either too large or waiting on a decision, and both should be resolved rather than accumulating.

## Commits

Format: `<type>(<scope>): <subject>`

- **type**: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `style`.
- **scope**: the affected area, for example `brand`, `ascii`, `settings`, `navbar`, `routes`, `persistence`, `importer`, `movements`, `layout`.
- **subject**: imperative mood, lowercase, no trailing period, at most 72 characters.
- **body** (optional): explain WHY the change exists, wrapped at around 72 columns.
- **breaking changes**: mark the subject with `!` and add a `BREAKING CHANGE:` footer describing the migration.

Examples:

```
feat(importer): map columns before validating rows
fix(persistence): keep repository order stable after delete
refactor(movements): move aggregation into a domain service
```

Rules:

- One commit is one coherent change, and it passes lint, typecheck and tests on its own.
- Tests ship in the same commit as the behaviour they cover; do not split a `feat` from its `test`.
- Never add `Co-Authored-By` trailers or any AI attribution.

## Pull requests

- Target `dev`, never `main`.
- Keep the diff under roughly 400 changed lines. Bigger work is split into stacked PRs.
- The description must answer: what changed, why, and how to verify it.
- The checks in "Before pushing" must pass.
- Merge with `--no-ff` so the feature boundary survives in the graph, or squash when the branch history is noisy.

## Before pushing

```bash
npm run lint
npm run typecheck
npx vitest run
npm run build
```

`npm test` runs Vitest in watch mode, so it hangs in CI and in scripts. Use `npx vitest run` (or `npm test -- --run`) for a single execution.

## Releases

1. Merge `dev` into `main` with `--no-ff`.
2. Bump `version` in both `package.json` and `package-lock.json`.
3. Create and push an annotated tag: `git tag -a vX.Y.Z -m "vX.Y.Z"` then `git push origin vX.Y.Z`.
4. Publish a GitHub Release from that tag.
5. Merge `main` back into `dev` so the branches do not drift.

## Repository hygiene

- No stash outlives its branch: commit or drop it before switching.
- No merged-and-forgotten branches; delete them after merge.
- Never commit generated output (`dist/`, `node_modules/`) or secrets.
- Keep the working tree clean before switching branches.
