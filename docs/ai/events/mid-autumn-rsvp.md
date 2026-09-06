# Mid-Autumn RSVP funnel

**Purpose:** Port of the Vite hub RSVP flow: register, pay, confirmed, promo codes, GOGOX voucher.

## Key files

- Routes: `src/app/(chrome)/mid-autumn-taiwan-festival/{page,layout}.tsx`, `pay/`, `confirmed/`
- Views: `src/views/MidAutumnFestival{Registration,Payment,Confirmed}.tsx`
- UI: `src/components/mid-autumn-rsvp/`
- Data/pricing: `src/data/midAutumnFestival2026.ts`, `src/lib/midAutumnFestivalPricing.ts`
- GraphQL booking: `src/services/midAutumnRegistration.ts`
- Blog overlay: `src/data/blogPostsMidAutumn.ts`, `src/views/BlogPost.tsx`

## Flow

1. `/mid-autumn-taiwan-festival` — hold booking (GraphQL) + optional promo code
2. Paid workshops → `/pay?ref=` receipt upload; free → `/confirmed?ref=`
3. Blog post injects `GogoxVoucherCard` at `data-component="gogox-voucher"`
4. `graphqlClient` treats all-null mutation payloads as errors (needed for promo apply)

## Rules / gotchas

- Pay/confirmed are `noIndex`. Registration is indexable and in `sitemap.ts`.
- Hide `ContactUsWidget` on `/mid-autumn-taiwan-festival*`.
- Identity still comes from Cognito JWT via existing GraphQL client.
- Images live in `public/assets/blog-mid-autumn-pet-hk/` (not Vite `@/assets` imports).

## Related

- [architecture.md](../architecture.md)
- Vite source: `petwell-hk-hub` Mid-Autumn pages/components

Last updated: 2026-09-06 (UTC+8)
