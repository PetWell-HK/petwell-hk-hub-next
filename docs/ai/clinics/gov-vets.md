# Clinic registered vets (web)

**Purpose:** Show VSB-registered vets on petwellhk.com clinic detail pages. App later.

## Key files

- UI: `src/components/ClinicRegisteredVets.tsx`
- Hook: `src/hooks/useClinicGovVets.ts`
- HTTP: `src/services/clinicVetsApi.ts` → `GET /api/clinics/:id/vets`
- Mount: `src/components/PlaceDetailLayout.tsx` when `placeType === "clinic"`

## Flow

1. Clinic detail loads as today (AppSync place).
2. Client fetches petwell-api vets for that `placeId`.
3. If the list is empty or the request fails, render nothing.

## Gotchas

- Source attribution links to the VSB register.
- Local `next dev` uses petwell-api on `:3457` when healthy, else production API.

## Related

- petwell-api `docs/ai/clinics/gov-vets.md`

Last updated: 2026-09-14 (UTC+8)
