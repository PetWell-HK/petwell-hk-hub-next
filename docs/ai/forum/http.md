# Forum HTTP API

**Purpose:** Public HK hub forum reads/writes petwell-api. Client profile still uses AppSync.

## Key files

- HTTP helper: `src/services/forumHttp.ts`, `src/config/petwellApi.ts`
- Forum functions: `src/services/forumApi.ts`
- UI: `src/views/Forum.tsx`, `src/components/CreatePostDialog.tsx`
- SSR: `src/lib/server/ssrContent.ts` (`ssrForumListing`, `ssrForumPost`)
- Sitemap: `src/lib/server/sitemapSources.ts`

## Env

- `NEXT_PUBLIC_PETWELL_API_URL` or `VITE_PETWELL_API_URL`
- Server-only fallback: `PETWELL_API_URL`
- Local default: `http://127.0.0.1:3457`

## Gotchas

- Vote POST returns `{ value, post|reply }` with updated counters.

Last updated: 2026-09-06 (UTC+8)
