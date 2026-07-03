## Context

The About page (`src/views/SettingsAboutView.vue`) currently fetches the latest release of the Salt Rim frontend from `https://api.github.com/repos/karlomikus/vue-salt-rim/releases?per_page=1`, compares it against `window.srConfig.VERSION`, and renders the release notes via `micromark`. There is no equivalent for the Bar Assistant backend API.

The backend already exposes a typed endpoint that makes most of the work straightforward:

- `GET /server/version` (operationId `showServerVersion`) returns `ServerVersion` with `version` (running), `latest_version` (latest published on GitHub), and `is_latest` (boolean). It requires no authentication (`security: {}` in `spec.yml`).
- The existing client wrapper `BarAssistantClient.getServerVersion()` (already typed via generated `api.d.ts`) returns this object.

So the running backend version and "is it latest" comparison come for free from the API — we do not need to semver-compare backend versions client-side. The only piece the API does not provide is the **release notes body**, which still has to come from the GitHub Releases API for `karlomikus/bar-assistant`.

## Goals / Non-Goals

**Goals:**
- Show the connected Bar Assistant backend version on the About page, sourced from `GET /server/version`.
- Render the backend's latest GitHub release notes (body) as markdown, mirroring the frontend changelog rendering.
- Reuse the existing manual "Check for updates" trigger so both changelogs refresh together.
- Degrade gracefully when the backend is unreachable or returns no version (still show GitHub latest release notes where possible).

**Non-Goals:**
- Aggregating/rendering the full history of all backend releases (only the latest release notes, consistent with the frontend behavior).
- Backend-side changes (no new API endpoints).
- Auto-refreshing or polling beyond the existing on-mount + manual trigger flow.
- Deep-linking to a backend admin upgrade flow.

## Decisions

### Decision: Use `GET /server/version` for the running backend version
**Rationale:** The endpoint already exists, is typed in the generated client, requires no auth, and returns `version`, `latest_version`, and `is_latest`. Re-implementing semver comparison client-side for the backend would duplicate logic that the backend already owns.
**Alternative considered:** Reuse the frontend's `parseSemver` + GitHub-latest comparison for the backend. Rejected because the backend already provides `is_latest`, so client-side semver comparison would be redundant and could drift from the backend's own logic.

### Decision: Fetch backend release notes from GitHub Releases API (`karlomikus/bar-assistant`)
**Rationale:** The `/server/version` payload gives the latest *tag* but not the release *notes body*. To render a changelog we need the body, which GitHub Releases provides. Reusing the existing `micromark` rendering keeps styling consistent.
**Alternative considered:** Add a backend endpoint that returns its own release notes. Rejected — out of scope (no backend changes) and GitHub Releases is the canonical source.

### Decision: Extract a small composable `useGitHubReleases.ts`
**Rationale:** The frontend release-fetch logic (`fetch releases?per_page=1`, parse, error handling) is now needed twice (frontend repo + backend repo). Extracting it into a composable that takes a `repo` argument removes duplication and keeps the view readable.
**Alternative considered:** Inline a second `fetch` in the view. Rejected because it duplicates error/loading state and the markdown-render `computed` for two repos.

### Decision: Drive both fetches from one loading/error surface, per-section error isolation
**Rationale:** The backend version fetch and the GitHub release fetches are independent network calls. The view keeps a single `isChecking` flag (consistent with the current UX) but stores per-section error state so a backend version failure does not hide the frontend changelog, and vice versa.

### Decision: Sanitization parity with frontend changelog
**Rationale:** The existing changelog renders via `v-html` of `micromark` output without explicit sanitization. To avoid introducing a regression, the backend changelog follows the exact same rendering path. (The existing spec already documents a "Markdown content is safely rendered" requirement; this change keeps parity rather than widening the surface.)

## Risks / Trade-offs

- **GitHub API rate limiting (unauthenticated, 60 req/hr/IP):** Two release fetches per check (frontend + backend) instead of one. → Mitigation: per-request `per_page=1`, manual trigger (not polling), and per-section error messages so a rate-limited section degrades independently.
- **Backend offline / unreachable:** `/server/version` fails. → Mitigation: catch independently; show the GitHub latest backend release notes with a label indicating the connected version is unknown.
- **Backend version vs. GitHub latest tag mismatch:** The backend's `latest_version` could lag behind the actual newest GitHub release if the backend hasn't refreshed. → Mitigation: use the backend's own `latest_version`/`is_latest` for the version status, but fetch GitHub `per_page=1` for the release notes body. If the bodies' tag differs from `latest_version`, render whichever GitHub returned (the newest) — the version status still reflects the backend's authoritative answer.
- **i18n coverage:** New strings must land in all 19 locale files. → Mitigation: add English source strings to all locales as the fallback baseline (existing pattern in the repo).
