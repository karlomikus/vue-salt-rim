## ADDED Requirements

### Requirement: About page displays the connected Bar Assistant backend version

The About page SHALL display the version of the Bar Assistant backend API the client is connected to, obtained from the `GET /server/version` endpoint (`BarAssistantClient.getServerVersion()`).

#### Scenario: Backend version is displayed
- **WHEN** the About page loads and `GET /server/version` responds successfully
- **THEN** the page SHALL display the backend `version` string in a dedicated section labeled as the backend/API version

#### Scenario: Backend reports it is up to date
- **WHEN** the `/server/version` response has `is_latest` set to `true`
- **THEN** the page SHALL indicate that the connected backend is up to date

#### Scenario: Backend reports a newer version is available
- **WHEN** the `/server/version` response has `is_latest` set to `false` and provides a `latest_version`
- **THEN** the page SHALL display an "update available" notice with the `latest_version` and a link to the Bar Assistant GitHub releases

#### Scenario: Backend version endpoint is unreachable
- **WHEN** the `GET /server/version` request fails (network error, non-200, or rate limit)
- **THEN** the page SHALL still display the frontend version/changelog and show an informative message that the backend version could not be retrieved, without breaking the rest of the page

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
