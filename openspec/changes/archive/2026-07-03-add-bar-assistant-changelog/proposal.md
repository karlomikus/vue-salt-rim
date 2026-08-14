## Why

The About page currently only shows version and changelog information for the Salt Rim frontend client (`karlomikus/vue-salt-rim`). The frontend talks to the Bar Assistant backend API (`karlomikus/bar-assistant`), but users have no visibility into which API version they are connected to or what has changed in it. Surfacing the backend's GitHub release notes alongside the frontend changelog gives users a complete picture of what is running and what has improved, and helps them understand when a feature they see in the UI requires a backend upgrade.

## What Changes

- Add a fetch of the latest release from the Bar Assistant API's GitHub Releases (`karlomikus/bar-assistant`) on the About page.
- Display the connected Bar Assistant version where available (e.g. from an existing API endpoint/version response) alongside the latest published GitHub release version.
- Render the Bar Assistant release notes (body) as markdown-formatted changelog content, mirroring how the frontend changelog is rendered.
- Reuse the existing manual "Check for updates" trigger so both changelogs (frontend + backend) refresh together.
- Handle the absence of a discoverable backend version gracefully (e.g. backend offline, no version endpoint) by still showing the latest GitHub release notes with an appropriate label.
- Add i18n strings for the new section labels across supported locales.

## Capabilities

### New Capabilities
<!-- None: this work extends the existing about-page capability rather than introducing a new one. -->

### Modified Capabilities
- `about-page`: Adds requirements for displaying the Bar Assistant backend API version and rendering its GitHub release-notes changelog on the About page, in addition to the existing frontend client changelog.

## Impact

- **Code**: `src/views/SettingsAboutView.vue` gains a second release-fetch, second version comparison, and a second changelog section. Shared release-fetch/render logic may be extracted into a small composable (e.g. `useGitHubReleases.ts`) to avoid duplication.
- **i18n**: New keys added to all locale files under `src/locales/messages/` (e.g. `about.backend-version`, `about.backend-changelog`, `about.backend-update-available`).
- **Dependencies**: No new runtime dependencies; reuses `micromark` already present.
- **API**: May leverage an existing Bar Assistant endpoint or response header that exposes the API version; if none is available, only the GitHub latest release is shown. No backend changes are required.
- **Specs**: Updates the `about-page` spec to capture the backend changelog behavior.
