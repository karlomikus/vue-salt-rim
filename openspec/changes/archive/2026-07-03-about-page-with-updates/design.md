## Context

The application already exposes its version via `window.srConfig.VERSION` (set to `"dev"` in development). This version is displayed in the site footer and reported to Sentry. However, there is no dedicated UI for users to see what version they're on, check if a newer version is available, or read the changelog.

The project is hosted on GitHub at `karlomikus/vue-salt-rim` and uses GitHub Releases for versioned releases. The GitHub Releases API is public and requires no authentication for read access, making it a zero-config data source for version checks and changelogs.

The settings section already has a well-established navigation pattern (`SettingsNavigation.vue`) and routing structure (flat routes under `/settings/`). The new About page follows the same conventions.

## Goals / Non-Goals

**Goals:**
- Display the running application version prominently
- Check GitHub Releases for the latest version and compare with the running version
- Show an "Update available" indicator when a newer release exists
- Render release notes (changelog) from GitHub Releases as formatted markdown
- Fit seamlessly into the existing settings navigation and layout

**Non-Goals:**
- Auto-update mechanism (users are directed to GitHub for the update itself)
- Caching of release data beyond the user's current session
- Checking for pre-releases or draft releases
- Displaying the full list of all past releases (current release changelog is sufficient)
- Notification/badge system outside the About page itself

## Decisions

### Decision 1: Fetch releases on page load, no background polling

**Choice**: Fetch the latest release from the GitHub API when the About page is mounted. Do not poll in the background or on app startup.

**Rationale**: Keeps it simple. Version checks are not time-sensitive — checking when the user intentionally visits the About page is the right granularity. Avoids unnecessary API calls and GitHub rate limiting (60 req/hour for unauthenticated requests).

**Alternatives considered**:
- Polling on app startup: Would add startup latency and hit rate limits for large user bases behind the same IP.
- Service Worker background sync: Overengineered for this use case.

### Decision 2: Use GitHub Releases API directly from the browser

**Choice**: Fetch `https://api.github.com/repos/karlomikus/vue-salt-rim/releases?per_page=1` directly from the browser using `fetch`.

**Rationale**: The endpoint is public, CORS-enabled, and requires no authentication for read access. No backend changes needed. The rate limit (60 req/hour/IP) is sufficient since requests only happen when users visit the About page.

**Alternatives considered**:
- Backend proxy: Adds unnecessary complexity and a new API endpoint. Only needed if we anticipated hitting rate limits, which is unlikely.
- Cached backend endpoint: Overkill for this low-traffic feature.

### Decision 3: Use the latest full release (ignore pre-releases)

**Choice**: The default `GET /repos/:owner/:repo/releases` returns only published (non-draft, non-prerelease) releases. We use `per_page=1` to get only the latest.

**Rationale**: Users should only be notified about stable releases. Pre-releases and drafts are for testing and not relevant to end users.

### Decision 4: Simple semver comparison for update detection

**Choice**: Compare `window.srConfig.VERSION` with the GitHub release `tag_name` (after stripping a leading `v` if present) using a simple semver library or manual comparison. If the running version is not valid semver (e.g., `"dev"`), skip the comparison and show "Development version".

**Rationale**: GitHub releases use tags like `v1.2.3`. Comparing semver is standard practice. The `"dev"` case is handled gracefully.

### Decision 5: Render changelog as markdown using a lightweight library

**Choice**: Use `marked` (already available as a dependency, commonly used in Vue projects) to render the release body (GitHub-flavored markdown) as HTML within a scoped container.

**Rationale**: GitHub release notes are markdown. Rendering them directly preserves formatting (headings, lists, links, code blocks). Using a library avoids writing a custom markdown parser.

**Alternatives considered**:
- Plain text display: Loses all formatting; poor UX.
- GitHub's rendered HTML (via `Accept: application/vnd.github.html+json`): Would require trusting arbitrary HTML from GitHub; less safe. Marked with sanitization is safer.

### Decision 6: Vue Composition API with `<script setup lang="ts">`

**Choice**: Follow the project convention of Composition API with `<script setup lang="ts">` for the new component.

**Rationale**: Consistent with the rest of the codebase as defined in AGENTS.md.

## Risks / Trade-offs

- **[Rate limiting]** GitHub API allows 60 unauthenticated requests/hour per IP. If many users share an IP (e.g., office network) and all visit the About page frequently, they could hit the limit. → **Mitigation**: Request only fires on explicit page navigation; add a "Check for updates" button so the user controls when to re-fetch. Show a friendly error if rate-limited.
- **[Network failures]** If GitHub is unreachable, the page should still render with the current version info, just without the "latest release" comparison. → **Mitigation**: Wrap the fetch in try/catch; show an informative message rather than a broken page.
- **[Incorrect version comparison]** If `window.srConfig.VERSION` is not a valid semver string in production, comparison may fail. → **Mitigation**: Graceful fallback — show "Unable to check for updates" if comparison fails.
- **[Markdown XSS]** Rendering untrusted markdown as HTML could introduce XSS if GitHub release notes contain malicious content. → **Mitigation**: Use `marked` with `DOMPurify` for sanitization, or configure marked's sanitizer option.