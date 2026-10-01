# Place search HTTP

**Purpose:** Restaurant and place lists call petwell-api `GET /api/places/search` instead of the old AppSync place-search Lambda.

## Key files

- Client: `src/services/placeSearchUtils.ts` (`runPlaceSearch`)
- API base: `src/config/petwellApi.ts` (`getPetwellApiBase`)
- Env: `NEXT_PUBLIC_PETWELL_API_URL` / `VITE_PETWELL_API_URL` (prod) and `NEXT_PUBLIC_PETWELL_API_URL_DEV` / `VITE_PETWELL_API_URL_DEV` (local, default `http://127.0.0.1:3457`)

## Flow

1. `next dev` (`NODE_ENV !== production`) probes `GET /api/health` on the local URL.
2. If that returns `{ ok: true }` or `service: petwell-api`, search uses localhost.
3. Otherwise it falls back to `https://api.petwellhk.com`. Production builds skip the probe.

## Gotchas

- The health probe is cached for the session. Restart `next dev` after you start local petwell-api (`npm run dev` in petwell-api, port 3457).
- Production `api.petwellhk.com` does not serve `/api/places/search` until that route is deployed, so a failed local probe shows up as a 404 on the prod host.

## Related

- [forum/http.md](../forum/http.md) — same API base resolver
- petwell-api `docs/ai/places/search.md`

Last updated: 2026-10-02 (UTC+8)
