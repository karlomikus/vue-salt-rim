# About Page

## Purpose

Provides users with visibility into the running application version, automatic update checking against GitHub Releases, and a readable changelog — all accessible from the settings section.

## Requirements

### Requirement: About page displays current application version

The About settings page SHALL display the current application version obtained from `window.srConfig.VERSION`, shown in both the version section and in the Client version tile alongside the API version tile.

#### Scenario: Version is displayed on page load
- **WHEN** a user navigates to `/settings/about`
- **THEN** the current version string from `window.srConfig.VERSION` is visibly displayed in the version section at the top of the page AND in the Client version tile

#### Scenario: Development version is shown
- **WHEN** the version is `"dev"` or missing
- **THEN** the page SHALL display "Development version" instead of a version number in both the version section and the Client tile

#### Scenario: Version tiles are populated with real data
- **WHEN** the About page loads successfully
- **THEN** the Client version tile SHALL show the current frontend version and the latest GitHub release version, and the API version tile SHALL show the connected backend version and the latest available backend version, replacing the former placeholder values

### Requirement: About page checks for updates from GitHub Releases

The About page SHALL fetch the latest stable release from the GitHub Releases API and compare it with the running version to determine if an update is available.

#### Scenario: Newer version available
- **WHEN** the latest GitHub release tag (e.g., `v1.3.0`) represents a newer semver version than `window.srConfig.VERSION` (e.g., `1.2.0`)
- **THEN** the page SHALL display an "Update available" notice with the latest version number and a link to the GitHub release

#### Scenario: Running latest version
- **WHEN** the running version matches or exceeds the latest GitHub release version
- **THEN** the page SHALL indicate that the application is up to date

#### Scenario: Version comparison is not possible
- **WHEN** `window.srConfig.VERSION` is `"dev"`, missing, or not a valid semver string
- **THEN** the page SHALL display the GitHub latest version but indicate that automatic comparison is unavailable (development build)

#### Scenario: GitHub API is unreachable
- **WHEN** the fetch to the GitHub Releases API fails (network error, rate limit, or non-200 response)
- **THEN** the page SHALL still display the current version and show an informative message that update information could not be retrieved

### Requirement: About page displays changelog from GitHub release notes

The About page SHALL render the release notes (body) of the latest GitHub release as formatted content.

#### Scenario: Changelog is displayed
- **WHEN** the latest GitHub release is successfully fetched
- **THEN** the release notes (body) SHALL be rendered below the version information using markdown formatting (headings, lists, links, code blocks)

#### Scenario: Empty or missing release notes
- **WHEN** the latest release has no body or an empty body
- **THEN** the page SHALL display a message indicating no release notes are available for this version

#### Scenario: Markdown content is safely rendered
- **WHEN** the release notes contain HTML or potentially harmful content
- **THEN** the rendered output SHALL be sanitized to prevent XSS

### Requirement: Manual update check button

The About page SHALL provide a manual trigger for re-checking updates to work around rate limiting and network issues.

#### Scenario: User manually checks for updates
- **WHEN** the user clicks a "Check for updates" button
- **THEN** the page SHALL re-fetch the latest release from GitHub and update the version comparison and changelog display

#### Scenario: Check button shows loading state
- **WHEN** the update check is in progress (after clicking the button or on initial load)
- **THEN** the button SHALL display a loading indicator and be disabled to prevent duplicate requests

### Requirement: About navigation link in settings sidebar

The settings navigation SHALL include an "About" link accessible to all authenticated users.

#### Scenario: About link is visible
- **WHEN** any authenticated user views the settings sidebar
- **THEN** an "About" link pointing to `/settings/about` is visible in the navigation, outside the admin-only section

#### Scenario: About link highlights when active
- **WHEN** the user is on the About page
- **THEN** the "About" navigation link SHALL be visually highlighted as the active link

### Requirement: About page displays the connected Bar Assistant backend version

The About page SHALL display the version of the Bar Assistant backend API the client is connected to, obtained from the `GET /server/version` endpoint (`BarAssistantClient.getServerVersion()`), shown in both the backend version section and in the API version tile.

#### Scenario: Backend version is displayed
- **WHEN** the About page loads and `GET /server/version` responds successfully
- **THEN** the page SHALL display the backend `version` string in the dedicated backend section AND in the API version tile

#### Scenario: Backend reports it is up to date
- **WHEN** the `/server/version` response has `is_latest` set to `true`
- **THEN** the page SHALL indicate that the connected backend is up to date, AND the API version tile SHALL display a checkmark

#### Scenario: Backend reports a newer version is available
- **WHEN** the `/server/version` response has `is_latest` set to `false` and provides a `latest_version`
- **THEN** the page SHALL display an "update available" notice with the `latest_version` and a link to the Bar Assistant GitHub releases, AND the API version tile SHALL show the `latest_version` without a checkmark

#### Scenario: Backend version endpoint is unreachable
- **WHEN** the `GET /server/version` request fails (network error, non-200, or rate limit)
- **THEN** the page SHALL still display the frontend version/changelog and show an informative message that the backend version could not be retrieved, without breaking the rest of the page, AND the API tile SHALL display "Not available" for the current version

### Requirement: About page displays the Bar Assistant backend changelog from GitHub release notes

The About page SHALL render the release notes (body) of the latest Bar Assistant release from the GitHub Releases API for the `karlomikus/bar-assistant` repository, as a second changelog section distinct from the frontend client changelog.

#### Scenario: Backend changelog is displayed
- **WHEN** the latest `karlomikus/bar-assistant` GitHub release is successfully fetched
- **THEN** its release notes (body) SHALL be rendered as a separate changelog section using the same markdown rendering as the frontend changelog (headings, lists, links, code blocks)

#### Scenario: Empty or missing backend release notes
- **WHEN** the latest backend release has no body or an empty body
- **THEN** the page SHALL display a message indicating no release notes are available for this backend version

#### Scenario: Backend GitHub release fetch fails
- **WHEN** the fetch to the Bar Assistant GitHub Releases API fails (network error, rate limit, or non-200 response)
- **THEN** the page SHALL still display the backend version (when available) and the frontend changelog, and show an informative message that the backend changelog could not be retrieved

### Requirement: Manual update check refreshes both frontend and backend changelogs

The manual "Check for updates" trigger SHALL re-fetch both the frontend client release and the Bar Assistant backend version/release data simultaneously.

#### Scenario: User manually checks for updates
- **WHEN** the user clicks the "Check for updates" button
- **THEN** the page SHALL re-fetch the Salt Rim frontend release, the Bar Assistant `/server/version`, and the Bar Assistant GitHub release in parallel, and update both the version statuses and both changelog displays

#### Scenario: Check button loading state covers both fetches
- **WHEN** any of the frontend or backend update checks is in progress
- **THEN** the button SHALL display a loading indicator and be disabled until all in-flight checks resolve (success or failure)