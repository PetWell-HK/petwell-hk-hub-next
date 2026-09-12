# Place review author display

**Purpose:** Google-imported reviews show the Maps username plus a Google badge, not “外部用戶 google”. Avatars without a photo use hashed initials.

## Key files

- `src/utils/reviewDisplay.ts`
- `src/components/ReviewAuthorLink.tsx`
- `src/components/ReviewSourceLabel.tsx`
- `src/views/RestaurantDetail.tsx`
- `src/components/PlaceDetailLayout.tsx`

## Flow

1. Google scrape stores reviewer name on `title`.
2. Author line uses Client name, else that title for non-petwell `source`.
3. Hide the title heading when it duplicates the author name.
4. Keep the Google badge on the date row.

Last updated: 2026-09-11 (UTC+8)
