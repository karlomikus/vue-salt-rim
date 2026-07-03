## ADDED Requirements

### Requirement: About page displays current application version

The About settings page SHALL display the current application version obtained from `window.srConfig.VERSION`.

#### Scenario: Version is displayed on page load
- **WHEN** a user navigates to `/settings/about`
- **THEN** the current version string from `window.srConfig.VERSION` is visibly displayed in a prominent section at the top of the page

#### Scenario: Development version is shown
- **WHEN** the version is `"dev"` or missing
- **THEN** the page SHALL display "Development version" instead of a version number

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