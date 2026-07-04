## MODIFIED Requirements

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