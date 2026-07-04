# About Version Tiles

## Purpose

Side-by-side Client and API version information tiles on the About page that display current version, latest version, and an up-to-date status indicator with checkmark.

## Requirements

### Requirement: Client version tile displays current version

The Client version tile SHALL display the running frontend application version obtained from `window.srConfig.VERSION`.

#### Scenario: Version is displayed in client tile
- **WHEN** the About page loads and `window.srConfig.VERSION` contains a valid version string (e.g., `"1.2.0"`)
- **THEN** the Client tile SHALL show that version as the "Current" value

#### Scenario: Development version in client tile
- **WHEN** `window.srConfig.VERSION` is `"dev"` or missing
- **THEN** the Client tile SHALL display "Development version" as the "Current" value

### Requirement: Client version tile displays latest version

The Client version tile SHALL display the latest GitHub release tag from `karlomikus/vue-salt-rim` as the "Latest" value.

#### Scenario: Latest version displayed in client tile
- **WHEN** the GitHub release for `karlomikus/vue-salt-rim` is successfully fetched
- **THEN** the Client tile SHALL display the release tag (e.g., `v1.3.0`) as the "Latest" value

#### Scenario: GitHub release fetch fails for client tile
- **WHEN** the GitHub release fetch fails (network error or rate limit)
- **THEN** the Client tile SHALL display an error/unknown indicator for "Latest" instead of crashing

### Requirement: Client version tile shows up-to-date checkmark

The Client version tile SHALL display a checkmark indicator when the running version matches or exceeds the latest GitHub release version.

#### Scenario: Client is up to date
- **WHEN** the running version (e.g., `1.3.0`) matches the latest GitHub release tag (e.g., `v1.3.0`)
- **THEN** the Client tile SHALL display a visible checkmark (✓) indicating "up to date"

#### Scenario: Client update available
- **WHEN** the latest GitHub release tag (e.g., `v1.3.0`) represents a newer semver than the running version (e.g., `1.2.0`)
- **THEN** the Client tile SHALL NOT display the checkmark, indicating an update is available

#### Scenario: Development build cannot be compared
- **WHEN** the running version is `"dev"` or not a valid semver
- **THEN** the Client tile SHALL NOT display the checkmark

### Requirement: API version tile displays current backend version

The API version tile SHALL display the version of the connected Bar Assistant backend obtained from `GET /server/version`.

#### Scenario: Backend version displayed in API tile
- **WHEN** `GET /server/version` responds successfully with a `version` string
- **THEN** the API tile SHALL display that version as the "Current" value

#### Scenario: Backend version fetch fails for API tile
- **WHEN** `GET /server/version` fails
- **THEN** the API tile SHALL display "Not available" as the "Current" value

### Requirement: API version tile displays latest backend version

The API version tile SHALL display the latest available backend version as the "Latest" value.

#### Scenario: Latest version from API response displayed in API tile
- **WHEN** `GET /server/version` returns `is_latest: false` with a `latest_version` string
- **THEN** the API tile SHALL display `latest_version` as the "Latest" value

#### Scenario: Already on latest, no newer version known
- **WHEN** `GET /server/version` returns `is_latest: true` and no `latest_version` is present, or the latest GitHub release tag equals the current backend version
- **THEN** the API tile SHALL display the current version as "Latest" or indicate it is latest

#### Scenario: No latest version information available
- **WHEN** the backend version endpoint succeeds but provides no `latest_version` and `is_latest` is not `true`, and the GitHub release for the backend cannot be fetched
- **THEN** the API tile SHALL indicate the latest version is unknown

### Requirement: API version tile shows up-to-date checkmark

The API version tile SHALL display a checkmark indicator when the connected backend is up to date.

#### Scenario: Backend is up to date
- **WHEN** `GET /server/version` returns `is_latest: true`, or the running backend version matches the latest available version
- **THEN** the API tile SHALL display a visible checkmark (✓) indicating "up to date"

#### Scenario: Backend update available
- **WHEN** `GET /server/version` returns `is_latest: false` and provides a `latest_version` that differs from the running version
- **THEN** the API tile SHALL NOT display the checkmark, indicating an update is available

### Requirement: Version tiles are displayed side by side

The Client and API version tiles SHALL be displayed side by side in a horizontal layout on the About page.

#### Scenario: Tiles render horizontally on desktop
- **WHEN** the About page is viewed on a viewport wider than 600px
- **THEN** the Client tile and API tile SHALL appear adjacent to each other in a single row

#### Scenario: Tiles stack vertically on mobile
- **WHEN** the About page is viewed on a viewport 600px or narrower
- **THEN** the tiles SHALL stack vertically, with the API tile below the Client tile

### Requirement: Both tiles share consistent visual styling

The Client and API tiles SHALL use the same visual styling (card background, border, typography, padding) to present a cohesive appearance.

#### Scenario: Consistent tile appearance
- **WHEN** the About page renders
- **THEN** both tiles SHALL use the same `block-container` CSS class and SHALL have equal height, consistent padding, and identical typographic treatment for labels and values