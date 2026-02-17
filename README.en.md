# Burnout Guard

Burnout Guard is a web app that helps office workers run a daily `start → execute → wrap-up` loop, then finish the day with a neutral review and actionable improvements for tomorrow.

## Core Features

- Start/end-of-day session flow
- To Do / Doing / Done task board (with drag and drop)
- Burnout risk scoring and summary
- End-of-day review + detailed AI suggestions
- Google sign-in (Supabase Auth)
- AI access control via BYOK (personal key) or Pro plan
- PWA install support (manifest + service worker)
- Multilingual UI (`en`, `ko`, `ja`)

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Auth/DB: Supabase
- API/Webhook: Cloudflare Workers
- Testing: Vitest, Testing Library, Playwright
- Architecture: Feature-Sliced Design (FSD)

## Project Structure

```text
src/
  app/         # app entry and global styles
  pages/       # route-level screens (dashboard, product, pricing, settings ...)
  widgets/     # screen-level compositions
  features/    # user action units
  entities/    # domain models and UI representation
  shared/      # shared API, libs, UI

workers/api/   # Cloudflare Worker API
supabase/      # SQL migration
docs/          # deployment/design documents
```

## Requirements

- Node.js 22 LTS
- pnpm

## Quick Start

1. Install dependencies

```bash
pnpm i
```

2. Configure environment variables

Copy `.env.example` to `.env`:

```env
VITE_APP_ENV=development
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxx
# Optional
# VITE_API_BASE_URL=https://your-worker-domain.workers.dev
```

3. Run development server

```bash
pnpm dev
```

Default routes:

- Home: `http://localhost:5173/`
- App: `http://localhost:5173/app/day`
- Pricing: `http://localhost:5173/pricing`

## Scripts

- `pnpm dev`: run local dev server
- `pnpm build`: production build
- `pnpm lint`: ESLint
- `pnpm typecheck`: TypeScript type check
- `pnpm test`: unit tests (Vitest)
- `pnpm test:e2e`: E2E tests (Playwright)
- `pnpm format`: Prettier formatting

## Test Checklist

Recommended before PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

## Supabase Setup

1. Create a Supabase project
2. Run migration:
   - `supabase/migrations/20260217_000001_init_auth_billing.sql`
3. Enable Google provider in Auth settings
4. Register redirect URLs (local + production domains)

Detailed checklist:

- `docs/deploy/cloudflare-supabase-setup-checklist.md`

## Cloudflare Deployment

### Frontend (Pages)

- Build command: `pnpm build`
- Output directory: `dist`
- Deploy command: leave empty for static Pages deploy

### Worker (API)

- Location: `workers/api`
- Main endpoints:
  - `GET /api/health`
  - `POST /api/ai/evaluate-day`
  - `POST /api/billing/webhook?provider=stripe|toss`

Auto deploy:

- `.github/workflows/deploy-worker.yml`
- Required GitHub Secrets:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

## PWA

- `public/manifest.webmanifest`
- `public/sw.js`
- `public/icons/*`
- `public/screenshots/*`

Service worker is registered in:

- `production`
- `localhost` / `127.0.0.1` (for local verification)

If icon/manifest updates do not appear:

1. DevTools → Application → Service Workers → Unregister
2. Application → Clear storage → Clear site data
3. Hard refresh

## Security Notes

- Never commit `.env`, API keys, or tokens.
- Use only `VITE_SUPABASE_PUBLISHABLE_KEY` on client.
- Keep server-only secrets (`SUPABASE_SECRET_KEY`, etc.) in Worker secrets.

## References

- Deployment checklist: `docs/deploy/cloudflare-supabase-setup-checklist.md`
- UI foundation doc: `docs/ui/hig-dashboard-foundation.md`
- Worker doc: `workers/api/README.md`
