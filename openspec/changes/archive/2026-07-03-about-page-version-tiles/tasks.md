## 1. i18n Keys

- [x] 1.1 Add `about.client`, `about.api`, `about.current`, `about.latest` keys to `src/locales/messages/en-US.json`
- [x] 1.2 Add corresponding keys to other locale files (follow existing pattern — keys with English fallback)

## 2. Tile Data Computeds

- [x] 2.1 Add `clientTileData` computed in `AboutInfo.vue` returning `{ currentVersion, latestVersion, isUpToDate, isLoading, error }` derived from existing `currentVersion`, `frontendRelease`, and `frontendUpdateStatus` refs/computeds
- [x] 2.2 Add `apiTileData` computed in `AboutInfo.vue` returning `{ currentVersion, latestVersion, isUpToDate, isLoading, error }` derived from existing `backendVersion`, `backendUpdateStatus` refs/computeds

## 3. Template: Replace Placeholder Tiles

- [x] 3.1 Replace the hardcoded `<ul>` placeholders under `.about-info__versions__tile.Client` with `v-if`/`v-else` blocks bound to `clientTileData` showing current version, latest version, and conditional checkmark
- [x] 3.2 Replace the hardcoded `<ul>` placeholders under `.about-info__versions__tile.API` with `v-if`/`v-else` blocks bound to `apiTileData` showing current version, latest version, and conditional checkmark
- [x] 3.3 Add loading and error states for each tile (e.g., "Checking…" while loading, "Unavailable" on error)

## 4. Styling

- [x] 4.1 Add CSS for `.about-info__versions__tile` to use flexbox/grid for side-by-side layout with equal height, consistent padding, and responsive stacking on mobile (<= 600px)
- [x] 4.2 Add CSS for the checkmark indicator (inline SVG or Unicode ✓ styled with accent color) and version value typography (font-weight, font-size)

## 5. Verification

- [x] 5.1 Verify tiles render correctly with mock version data (current < latest shows no checkmark, current === latest shows checkmark, dev mode shows "Development version")
- [x] 5.2 Verify responsive layout: tiles side-by-side above 600px, stacked below
- [x] 5.3 Verify the rest of the About page (version sections, changelogs, check button) still functions as before