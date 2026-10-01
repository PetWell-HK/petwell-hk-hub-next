# Architecture

**Purpose:** PetWell HK public Next.js site (forum, places, events, Mid-Autumn RSVP). Place search and forum use petwell-api HTTP. Place detail, events, and Mid-Autumn booking still use AppSync.

## Key files

- GraphQL client (Client profile + place detail + Mid-Autumn booking): `src/services/graphqlClient.ts`
- Forum HTTP: `src/services/forumHttp.ts`, `src/services/forumApi.ts`, `src/config/petwellApi.ts`
- Place search HTTP: `src/services/placeSearchUtils.ts`
- Place review submit: `src/services/placeReviewApi.ts` (`POST /api/reviews`)
- Forum UI: `src/views/Forum.tsx`, `src/app/(forum)/forum/`
- Mid-Autumn RSVP: `src/app/(chrome)/mid-autumn-taiwan-festival/`, `src/views/MidAutumnFestival*.tsx`, `src/components/mid-autumn-rsvp/`
- SSR/sitemap forum: `src/lib/server/ssrContent.ts`, `src/lib/server/sitemapSources.ts`
- Amplify config: `src/config/aws-exports.ts`

## Constraints

- New backend features: petwell-api, not Amplify schema.
- Forum UI and SSR must not call AppSync `listForumPosts` / `createModeratedForumPost`.
- Client profile (`getOrCreateClient`) stays GraphQL.
- Mid-Autumn promo apply treats an all-null GraphQL mutation as failure.

Last updated: 2026-10-02 (UTC+8)
