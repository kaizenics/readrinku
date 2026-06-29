# @rinku/api

Standalone manga API (Hono + Node) — the readrinku data layer (source scraping +
MyAnimeList enrichment) served over HTTP, decoupled from Next.js so it can be
hosted off Vercel. The mobile app (and optionally the web app) fetch this.

## Run locally

```bash
pnpm --filter @rinku/api dev      # http://localhost:3001 (tsx watch)
# or from the root:
pnpm dev:api
```

Endpoints (all under `/api`, plus `/health`):
`/api/home`, `/api/browse`, `/api/genre/:slug`, `/api/search`, `/api/manga/:slug`,
`/api/chapter?url=...&sourceId=...`.

`PORT` env var overrides the port (default 3001).

## Deploy (Railway / Render / Fly.io / any Node host)

It runs with `tsx` (no build step) and serves on `$PORT`.

- **Install:** `pnpm install` (run from the repo root so the workspace + `@rinku/core` resolve).
- **Start:** `pnpm --filter @rinku/api start`
- Set the platform's listen port via the `PORT` env var (most inject it automatically).
- Caching is in-memory (process-wide TTL), so prefer an always-on instance over
  one that spins down between requests for warm performance.

Point the mobile app at the deployed URL via `EXPO_PUBLIC_API_URL`.

## Deploy with Coolify (self-hosted VPS) — recommended if you have one

Cheapest predictable option: always-on (the in-memory cache stays warm) and no
metered CPU/bandwidth billing. A `Dockerfile` is included.

1. Coolify → New Resource → your server → **Git repository** (this repo).
2. Build Pack: **Dockerfile**. Dockerfile Location: `apps/api/Dockerfile`.
   Base Directory: `/` — the build context MUST be the repo root (monorepo).
3. Port: **3001** (the app listens on `$PORT`, default 3001).
4. Health check path: `/health`.
5. Coolify provisions a domain + Let's Encrypt SSL — use that HTTPS URL as the
   mobile app's `EXPO_PUBLIC_API_URL`.

Bandwidth stays low: only JSON passes through the API — images load on the device
directly from the source CDNs, not through your VPS. Don't add an image proxy
unless a source blocks hotlinking (that would route image bytes through the VPS).
Give the box ≥ 2 GB RAM for Coolify + the Node app.

