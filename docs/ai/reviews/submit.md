# Place review submit

**Purpose:** Writing a restaurant, clinic, salon, or lodging review posts to petwell-api `POST /api/reviews`. Flagged text goes to the same manual-review queue as forum posts.

## Key files

- Submit: `src/services/placeReviewApi.ts` (`createPlaceReview`)
- UI: `src/components/WritePlaceReviewCTA.tsx`
- Term list (client copy of forum rules): `src/utils/contentModeration.ts`
- HTTP: `src/services/forumHttp.ts`

## Flow

1. Photos still upload to Amplify Storage (`public/reviews/...`).
2. `createPlaceReview` sends the review body with the Cognito ID token.
3. `pendingReview` or `blocked` shows 「評價已送出審核，通過後會公開顯示」 and does not expect a public review object.
4. Rating totals are updated on the server. The client does not call `update*Rating` after create.

## Gotchas

- `source` stays `petwell-hk-hub` so admin filters match the Vite hub.
- Browser moderation does not hard-block before the request.

Last updated: 2026-10-02 (UTC+8)
