# Universal / App Links (petwellhk.com)

These files must be live for the PetWell mobile app to open shared HTTPS links.

## Endpoints

| URL | Source file |
|-----|-------------|
| `https://petwellhk.com/.well-known/apple-app-site-association` | `apple-app-site-association` (no extension; preferred by Apple) |
| `https://petwellhk.com/.well-known/apple-app-site-association.json` | same content (backup) |
| `https://petwellhk.com/.well-known/assetlinks.json` | `assetlinks.json` |

`_headers` sets `Content-Type: application/json` for Netlify.

## Paths claimed (must match the mobile app)

`/forum/*`, `/clinics/*`, `/salons/*`, `/lodgings/*`, `/lodging/*`, `/restaurants/*`, `/malls/*`, `/home-visits/*`, `/review/*`, `/pet/*`, `/activate/*`, `/payment/*`

## After deploy

1. Confirm files return 200 (not the SPA HTML shell).
2. Rebuild the mobile app so Android `intentFilters` pick up new path prefixes.
3. On iOS, Universal Links may take time to re-verify after AASA changes.
