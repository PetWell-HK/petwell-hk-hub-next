# Mid-Autumn 2026 RSVP + pricing

**Purpose:** Free-entry RSVP at `/mid-autumn-taiwan-festival`. Workshops and family photo are optional paid add-ons, priced per item (no bundles).

## Key files

- Routes: `src/app/(chrome)/mid-autumn-taiwan-festival/{layout,page}.tsx`, `pay/`, `confirmed/`
- Views: `src/views/MidAutumnFestival{Registration,Payment,Confirmed}.tsx`
- UI: `src/components/mid-autumn-rsvp/FestivalOfferBoard.tsx`, `FestivalTicketBar.tsx`, `PromoCodePanel.tsx`
- Pricing: `src/lib/midAutumnFestivalPricing.ts`
- Event data: `src/data/midAutumnFestival2026.ts` (slots, payment, GOGOX)
- Blog CTA: `src/data/blogPostsMidAutumn.ts`

## Prices (Sep 2026 last-3-day workshop special)

| Item | Charge | Strikethrough |
|------|--------|----------------|
| Mooncake workshop | $480 | $688 |
| Scarf workshop | $180 | $288 |
| Family photo | $150 early bird | $200 |

`FESTIVAL_BUNDLES` is empty. `quoteFestivalItems` sums `standalonePrice`. Keep `QuoteLine` `bundle` for old Dynamo quotes on the payment page.

Promo codes apply on the RSVP workshop step. WhatsApp **6272 2164**. Pay by bank transfer or PayMe only.

## Flow

1. RSVP: free gifts (手帶, 全家福 soft copy, 嫦娥服). Workshops optional.
2. Select a workshop → timeslot picker appears under that card → promo code → quote.
3. Paid → `/pay?ref=` receipt upload; free → `/confirmed?ref=`.
4. Confirmed copy points back to last-3-day workshop prices if they skipped add-ons.

## Gotchas

- Magnet workshop is not offered. Do not reintroduce a $288 magnet special.
- Family photo still labelled 早鳥價; workshops with a special use **最後3日特價**.
- Timeslot select lives inside the workshop card. Do not wrap the card in `<label>` (nested select).
- Pay/confirmed are `noIndex`. Registration metadata is in the route `layout.tsx`.
- Images live in `public/assets/blog-mid-autumn-pet-hk/`.
- Timezone UTC+8. Festival 25–27 Sep 2026.

Last updated: 2026-10-02 (UTC+8)
