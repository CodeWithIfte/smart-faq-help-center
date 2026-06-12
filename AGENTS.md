# AGENTS.md — Smart FAQ Help Center

## Project state

This is a **brand-new Shopify app scaffold** (React Router v7 template). Zero custom business logic exists. The `extensions/` directory is empty — both Theme App Extensions (FAQ Block + Chat Widget) need to be built from scratch. The Prisma schema only has the `Session` model for OAuth.

The SRS at `SRS.md` defines the full vision. Build order: Prisma models → Admin CRUD (categories → FAQs → settings) → Storefront API → Theme App Extensions.

## Commands

| Command | What it does |
|---|---|
| `shopify app dev` | Start dev server (CLI injects tunnel + env vars) |
| `npm run typecheck` | `react-router typegen && tsc --noEmit` — run **before** tsc |
| `npm run lint` | ESLint (`.eslintrc.cjs`) |
| `npm run setup` | `prisma generate && prisma migrate deploy` |
| `npm run build` | `react-router build` |
| `npm run graphql-codegen` | Generate types from `./app/**/*.graphql` queries into `./app/types/` |
| `npm run prisma` | Prisma CLI passthrough |
| `npm run docker-start` | `npm run setup && npm run start` |

Order for schema changes: edit `prisma/schema.prisma` → `npm run prisma migrate dev --name <name>` → `npm run setup`.

## Architecture

- **Routing**: File-based via `@react-router/fs-routes` — `app/routes/` mirrors URL paths.
- **Auth**: Shopify OAuth via `@shopify/shopify-app-react-router`. All `/app/*` routes call `await authenticate.admin(request)` in their loader.
- **UI**: Polaris **web components** (`<s-page>`, `<s-button>`, `<s-link>`, etc.), not React components.
- **Database**: Prisma ORM → PostgreSQL (Neon, via `DATABASE_URL` in `.env`).
- **Extensions**: Live in `extensions/*` (pnpm workspace). Must be created with `shopify app generate extension`.
- **Session storage**: Prisma-backed, via `@shopify/shopify-app-session-storage-prisma`.
- **Entrypoint**: `app/root.tsx` (HTML shell) → `app/routes/app.tsx` (embedded admin layout) → per-route loaders/actions.

## Key constraints

- **Shopify env vars** (`SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SCOPES`, `SHOPIFY_APP_URL`) are injected by the Shopify CLI during `shopify app dev` — they are **not** in `.env`.
- **Embedded app rules**: Use `Link` from `react-router` (not `<a>`). Use `redirect` from `authenticate.admin` (not react-router's `redirect`). Use `useSubmit` from `react-router` for form submissions.
- **GraphQL codegen** scans `./app/**/*.{js,ts,jsx,tsx}` for `#graphql` tagged templates and outputs types to `./app/types/`.
- **React Router typegen** creates `.react-router/types/` — `tsc --noEmit` depends on it. Run `npm run typecheck` rather than just `tsc --noEmit`.
- **Dev store**: `app-development-course-eyxe01uy.myshopify.com` — linked in `.shopify/project.json`.
- **Existing migration uses SQLite syntax** — the datasource provider in `schema.prisma` is now PostgreSQL. Any new migration must use PostgreSQL-compatible column types.
- **No tests, no CI, no pre-commit hooks** exist yet. Add them as needed.
- **Indent**: 2 spaces (`.editorconfig`). Prettier ignores `prisma/` and `.shopify/`.
- **Extensions must be created via CLI** (`shopify app generate extension`), not manually — they need proper Shopify manifest files.
