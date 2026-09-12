# Forum HTTP API

**Purpose:** Public HK hub forum reads/writes petwell-api. Client profile still uses AppSync.

## Key files

- HTTP helper: `src/services/forumHttp.ts`, `src/config/petwellApi.ts`
- Forum functions: `src/services/forumApi.ts`
- UI: `src/views/Forum.tsx`, `src/components/CreatePostDialog.tsx`
- SSR: `src/lib/server/ssrContent.ts` (`ssrForumListing`, `ssrForumPost`)
- Sitemap: `src/lib/server/sitemapSources.ts`

## Env

- Production: `NEXT_PUBLIC_PETWELL_API_URL` or `VITE_PETWELL_API_URL` (server: `PETWELL_API_URL`). Default `https://api.petwellhk.com`.
- Local: `NEXT_PUBLIC_PETWELL_API_URL_DEV` / `VITE_PETWELL_API_URL_DEV` / `PETWELL_API_URL_DEV`. Default `http://127.0.0.1:3457`.
- `next dev`: probe `GET /api/health` on local, then fall back to production. `next start` / Vercel: production URL only. Localhost in the prod var is ignored.

## Gotchas

- Vote POST returns `{ value, post|reply }` with updated counters.

Last updated: 2026-09-13 (UTC+8)
