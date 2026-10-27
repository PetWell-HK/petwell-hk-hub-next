# Phone login (HK hub)

**Purpose:** Let a backend-created Suppaw phone account sign in, then turn it into a normal email account.

## Key files

- `src/lib/phoneLogin.ts`
- `src/components/AuthPanel.tsx`
- `src/contexts/AuthPanelContext.tsx` (`AuthView` includes `CLAIM_EMAIL`)

## Flow

1. Landing input is `type="text"`. An 8-digit HK mobile skips the dummy-password probe and opens the password step with username `+852…`.
2. After sign-in, an ID token email ending in `@phone.petwellhk.com` opens `CLAIM_EMAIL`.
3. Claim `POST`s `https://suppaw.petwellhk.com/api/account/claim-email` with the ID token, then signs out and signs in with the new email.
4. Forgot-password is hidden for a phone (Cognito would try SMS).

## Rules / gotchas

- No public phone signup. The pool allows phone usernames; this UI must not offer it.
- `CLAIM_EMAIL` must stay in both title and description switches (`never` default).
- Keep this file in step with `petwell-hk-hub` `src/components/AuthPanel.tsx`.

## Related

- Volunteer hub claim: petwell-volunteer-hub `docs/ai/auth/cognito-and-membership.md`

Last updated: 2026-10-27 (UTC+8)
