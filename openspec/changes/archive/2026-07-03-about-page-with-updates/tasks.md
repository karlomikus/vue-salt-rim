## 1. Routing and Navigation

- [x] 1.1 Add `/settings/about` route in `src/router/index.js` with route name `settings.about` and lazy-loaded `SettingsAboutView.vue` component (no `meta.requiresBar`, accessible to all authenticated users)
- [x] 1.2 Add "About" navigation link to `src/components/Settings/SettingsNavigation.vue` in the top section (above the admin-only block), using `RouterLink` with `{name: 'settings.about'}` and translation key `about.title`

## 2. i18n Translations

- [x] 2.1 Add translation key `about.title` = "About" to all locale files (`src/locales/*.js`)
- [x] 2.2 Add translation keys for version label, update available, up to date, dev version, check for updates button, changelog heading, no release notes, and error messages to all locale files

## 3. About Page Component

- [x] 3.1 Create `src/views/SettingsAboutView.vue` with `<script setup lang="ts">` following project conventions (Composition API, 4-space indent, single quotes, semicolons)
- [x] 3.2 Display current app version from `window.srConfig.VERSION` in a prominent section at the top of the page; show "Development version" message when version is `"dev"` or missing
- [x] 3.3 Fetch latest release from `https://api.github.com/repos/karlomikus/vue-salt-rim/releases?per_page=1` on mount using `fetch` with error handling (try/catch), storing result in a reactive ref
- [x] 3.4 Implement semver comparison: strip leading `v` from GitHub tag, compare with `window.srConfig.VERSION` using proper semver logic; show "Update available" notice with link to the release when newer, or "Up to date" when current
- [x] 3.5 Handle non-semver version gracefully: when `window.srConfig.VERSION` is `"dev"` or not valid semver, display the GitHub latest version info but indicate that automatic comparison is unavailable (development build)
- [x] 3.6 Render changelog: pass the release `body` through `micromark` (already a project dependency) and display as sanitized HTML using `v-html`; show "No release notes available" message when body is empty or missing
- [x] 3.7 Add "Check for updates" button that re-triggers the GitHub API fetch; show loading state on the button during fetch and disable it to prevent duplicate requests

## 4. Styling and Polish

- [x] 4.1 Add scoped CSS styles for the About page component matching the existing settings page aesthetic (consistent typography, spacing, colors)
- [x] 4.2 Style the changelog rendered markdown content with appropriate typography (headings, lists, code blocks, links) matching the app's visual design
- [x] 4.3 Style the "Update available" notice as a visually distinct callout (e.g., accent border, icon) to draw user attention
- [x] 4.4 Ensure the page layout is responsive and works correctly on mobile viewports

## 5. Verification

- [x] 5.1 Verify the route works: navigate to `/settings/about` and confirm the page loads
- [x] 5.2 Verify navigation link appears in settings sidebar and highlights when active
- [x] 5.3 Test with `window.srConfig.VERSION = "dev"` — confirm "Development version" message and GitHub latest version are shown
- [x] 5.4 Test update check flow by mocking the GitHub API response (or testing against real API) — confirm "Update available" vs "Up to date" states
- [x] 5.5 Test error state by temporarily blocking the GitHub API URL — confirm graceful fallback with current version still displayed
- [x] 5.6 Run `bun run lint`, `bun run type-check` and fix any issues