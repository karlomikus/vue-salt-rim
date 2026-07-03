## 1. Refactor: extract GitHub releases composable

- [x] 1.1 Create `src/composables/useGitHubReleases.ts` exposing a function that takes a `repo` argument (e.g. `karlomikus/vue-salt-rim`, `karlomikus/bar-assistant`) and returns `{ release, isLoading, error, fetch() }`
- [x] 1.2 Move the existing `fetch('https://api.github.com/repos/.../releases?per_page=1')`, `GitHubRelease` interface, error handling, and `micromark` rendering into the composable
- [x] 1.3 Refactor `src/views/SettingsAboutView.vue` to use the composable for the frontend client release, preserving current behavior

## 2. Backend version fetch

- [x] 2.1 Add a `backendVersion` ref and a `fetchBackendVersion()` function in `SettingsAboutView.vue` that calls `BarAssistantClient.getServerVersion()` and stores `{ version, latest_version, is_latest }`
- [x] 2.2 Add per-section error state for the backend version fetch so failures do not break the frontend changelog
- [x] 2.3 Compute a backend update status (`up-to-date` | `update-available` | `unknown`) from `is_latest` and `latest_version`, falling back to `unknown` when the fetch fails

## 3. Backend changelog fetch and render

- [x] 3.1 Use `useGitHubReleases('karlomikus/bar-assistant')` to fetch the latest backend release (release notes body)
- [x] 3.2 Render the backend release notes as markdown via `micromark`, reusing the existing `.about-page__changelog-content` styling in a separate section

## 4. UI: backend section in About page

- [x] 4.1 Add a "Backend version" block in the template showing the connected backend `version` and the up-to-date/update-available status with a link to `https://github.com/karlomikus/bar-assistant/releases` when an update is available
- [x] 4.2 Add a second changelog section titled with the backend changelog label, rendering the backend release notes (or the "no release notes" / error message fallbacks)
- [x] 4.3 Wire the existing "Check for updates" button to re-run frontend release fetch, backend `getServerVersion`, and backend GitHub release fetch in parallel, keeping a single `isChecking` flag disabled until all resolve

## 5. i18n

- [x] 5.1 Add new English source strings to `src/locales/messages/en-US.json` under the `about` namespace: `backend-version`, `backend-version-unknown`, `backend-up-to-date`, `backend-update-available`, `backend-changelog`, `backend-no-release-notes`, `backend-update-error`
- [x] 5.2 Copy the same English strings as the fallback baseline into every other locale file in `src/locales/messages/` (el-GR, cs-CZ, fr-FR, pl-PL, it-IT, hu-HU, fi-FI, pt-PT, da-DK, ro-RO, hr-HR, zh-CN, es-ES, no-NO, nl-NL, sv-SE, zh-TW, de-DE)

## 6. Validation and cleanup

- [x] 6.1 Run `docker compose exec app bun run lint-fix` and resolve any lint errors in changed files
- [x] 6.2 Run `docker compose exec app bun run type-check` and resolve any type errors
- [x] 6.3 Manually verify in the dev server: backend version + status renders, backend changelog renders, frontend changelog still renders, manual check button refreshes both, and an unreachable backend degrades gracefully
