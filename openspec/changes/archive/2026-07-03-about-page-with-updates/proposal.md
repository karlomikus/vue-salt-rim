## Why

Users currently have no way to check which version of the application they are running or see what's new. When updates are released, there's no in-app notification or changelog visibility, leaving users unaware of new features, bug fixes, and improvements. This page gives users transparency into the application version and makes staying current effortless.

## What Changes

- Add a new **About** settings page at `/settings/about` with version information, update checking, and changelog display
- Add a GitHub Releases integration that fetches the latest release and compares it against the running version
- Display the current app version prominently at the top of the page
- Show an "Update available" indicator when a newer GitHub release exists
- Render the full changelog (release notes) from GitHub Releases in a readable markdown format
- Add a navigation link to the settings sidebar ("About" — accessible to all authenticated users, no bar/admin requirement)
- Add i18n translations for the new About page strings

## Capabilities

### New Capabilities
- `about-page`: An About settings page that displays the current app version, checks for updates against GitHub Releases, and renders the release changelog

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **New file**: `src/views/SettingsAboutView.vue` — the About page component
- **Modified file**: `src/components/Settings/SettingsNavigation.vue` — add "About" nav link
- **Modified file**: `src/router/index.js` — add `/settings/about` route
- **New i18n keys**: In `src/locales/` — translation strings for the About page (version label, update available, check for updates, changelog heading, etc.)
- **External dependency**: GitHub Releases API (`https://api.github.com/repos/karlomikus/vue-salt-rim/releases`) — public, no authentication required for read access