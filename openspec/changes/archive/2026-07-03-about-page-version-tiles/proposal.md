## Why

The About page currently has static placeholder tiles for Client and API versions with empty values ("Current: " and "Latest: "). The version fetching logic already exists — frontend release via GitHub Releases, backend version via `/server/version` API — but the tiles don't wire up to this data. Users should see at a glance whether their client and API are up to date.

## What Changes

- Populate the Client tile with the running frontend version, latest GitHub release version, and a checkmark indicator when up to date
- Populate the API tile with the connected backend version, latest available version, and a checkmark indicator when up to date
- Add i18n keys for the tile labels ("Client", "API", "Current", "Latest")
- Style the tiles side-by-side with clear visual feedback (checkmark, version text)

## Capabilities

### New Capabilities
- `about-version-tiles`: Side-by-side Client and API version information tiles that display current version, latest version, and an up-to-date status indicator with checkmark

### Modified Capabilities
- `about-page`: The existing version display section is enhanced with populated version tiles replacing the placeholder markup

## Impact

- **Modified**: `src/components/Settings/AboutInfo.vue` — replace placeholder tile markup with data-bound tiles, add computed version statuses, add associated CSS
- **Modified**: `src/locales/messages/*.json` — add new translation keys for tile labels (about.client, about.api, about.current, about.latest)
- **Modified**: `openspec/specs/about-page/spec.md` — delta spec for the tile behavior
- **New**: `openspec/specs/about-version-tiles/spec.md` — spec for version tile component