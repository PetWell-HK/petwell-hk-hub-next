# Architecture

**Purpose:** PetWell HK public Next.js site (forum, places, events, Mid-Autumn RSVP). Places/events still use AppSync; **forum uses petwell-api HTTP**.

## Key files

- GraphQL client (Client profile + places + Mid-Autumn booking): `src/services/graphqlClient.ts`
- Forum HTTP: `src/services/forumHttp.ts`, `src/services/forumApi.ts` (forum functions), `src/config/petwellApi.ts`
- Forum UI: `src/views/Forum.tsx`, `src/app/(forum)/forum/`
- Mid-Autumn RSVP: `src/app/(chrome)/mid-autumn-taiwan-festival/`, `src/views/MidAutumnFestival*.tsx`, `src/components/mid-autumn-rsvp/`
- SSR/sitemap forum: `src/lib/server/ssrContent.ts`, `src/lib/server/sitemapSources.ts`
- Amplify config: `src/config/aws-exports.ts`

## Constraints

- New backend features: petwell-api, not Amplify schema.
- Forum UI and SSR must not call AppSync `listForumPosts` / `createModeratedForumPost`.
- Client profile (`getOrCreateClient`) stays GraphQL.
- Mid-Autumn promo apply treats an all-null GraphQL mutation as failure.

Last updated: 2026-09-06 (UTC+8)
