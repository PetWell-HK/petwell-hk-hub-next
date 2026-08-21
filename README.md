# PetWell HK Hub (Next.js)

Next.js App Router rewrite of [petwell-hk-hub](../petwell-hk-hub) with **same routes/UI** and stronger SEO via server metadata, sitemaps, and JSON-LD.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 3 + existing shadcn/Radix UI
- AWS Amplify (Cognito + AppSync GraphQL + S3)
- Supabase edge functions (selected features)
- i18next (zh-HK / en)

## Develop

```bash
npm install --legacy-peer-deps
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.local` keys (already scaffolded from the Vite app):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_PLACE_SEARCH_BACKEND` (`dynamo` | `opensearch`)
- `NEXT_PUBLIC_SITE_URL` (default `https://petwellhk.com`)
- Optional: `NEXT_PUBLIC_GRAPHQL_ENDPOINT`, `NEXT_PUBLIC_GRAPHQL_API_KEY`, `NEXT_PUBLIC_PRICE_REVIEW_API_URL`

`VITE_*` aliases are also accepted via `getPublicEnv()` for migration compatibility.

## SEO

- Root + per-route Metadata API (`buildMetadata`) with canonical, hreflang, OG/Twitter
- Organization + MobileApplication JSON-LD in root layout
- Dynamic `generateMetadata` for restaurants / clinics / salons / lodging / malls (AppSync fetch + ISR)
- `src/app/sitemap.ts` + `src/app/robots.ts`
- Static XML sitemaps retained under `public/`
- Security/SEO response headers in `next.config.ts`
- Permanent redirects for legacy aliases

## Project layout

| Path | Role |
|---|---|
| `src/app/` | App Router routes, sitemap, robots, `(chrome)` / `(forum)` / `(bare)` groups |
| `src/views/` | Client islands for interactive page UI |
| `src/components/` | Shared UI (`AppLink`, Header/Footer) |
| `src/lib/locale.ts` | Cookie locale (`petwell-locale`) |
| `src/lib/seo.ts` | Metadata helpers |
| `src/lib/server/` | Server GraphQL, dictionaries, place metadata |
| `public/assets/` | Static images |

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Notes

- Cognito OAuth redirect URLs must include your Next origin (e.g. `http://localhost:3000/auth/callback/`).
- Listing pages remain interactive client components; detail metadata is server-rendered for crawlers.
- Chinese path `/防走失狗牌` redirects to `/nametag`.
