## Context

The About page (`AboutInfo.vue`) already has placeholder `<div>` tiles for Client and API versions — hardcoded with "Current: " and "Latest: " labels but no values. All version data is already fetched: the frontend release via `useGitHubReleases("karlomikus/vue-salt-rim")`, the backend version via `BarAssistantClient.getServerVersion()`, and the backend GitHub release via `useGitHubReleases("karlomikus/bar-assistant")`. The existing update status computeds (`frontendUpdateStatus`, `backendUpdateStatus`) already compare running vs. latest versions. This change wires up the data to the tiles and adds visual feedback.

## Goals / Non-Goals

**Goals:**
- Replace placeholder tile markup with data-bound version tiles showing current version, latest version, and an up-to-date checkmark
- Both tiles (Client and API) sit side-by-side using existing layout
- Reuse existing computed properties where possible; add a dedicated tile status computed if needed
- Add minimal new i18n keys for tile labels

**Non-Goals:**
- Changing the overall About page layout or removing existing version sections
- Changing how versions are fetched or cached
- Extracting tiles into a separate Vue component (keep inline in AboutInfo.vue)
- Modifying backend `/server/version` endpoint behavior

## Decisions

### Decision 1: Inline tile data binding vs. new component

**Chosen: Inline binding in AboutInfo.vue**

The tiles are a visual rearrangement of already-computed data. Extracting them to a separate component adds indirection without reuse value — no other page shows version tiles. Keeping logic in AboutInfo.vue makes data flow obvious and avoids prop-drilling 4+ values per tile.

Alternatives considered:
- Separate `VersionTile.vue` component — cleaner separation but overkill for this scope; no other consumers
- Slots-based tile component — flexible but adds complexity without foreseeable need

### Decision 2: Reuse existing computed status vs. new tile-specific computed

**Chosen: New `tileFrontendStatus` and `tileBackendStatus` computed properties**

The existing computeds (`frontendUpdateStatus`, `backendUpdateStatus`) return values like `"newer"`, `"up-to-date"`, `"dev"`, `"checking"`, `"error"`. For tiles we need a simpler boolean: `isUpToDate: true | false`. We'll add dedicated computeds that derive from existing ones and also expose the version strings in a structured format:

```ts
interface TileData {
    currentVersion: string;
    latestVersion: string;
    isUpToDate: boolean;
    isLoading: boolean;
    error: boolean;
}
```

Alternatives considered:
- Reusing existing computeds directly in template — requires duplicating comparison logic in template expressions; harder to read
- Single combined tile status — tried, but Client and API have different data sources and status semantics

### Decision 3: Checkmark indicator rendering

**Chosen: CSS-pseudo or inline SVG checkmark**

Use a simple inline SVG checkmark (or Unicode ✓) conditionally rendered when `isUpToDate` is true. This avoids extra dependencies. CSS `::before`/`::after` approach considered but conditional rendering in template is more straightforward with `v-if`.

### Decision 4: i18n keys

**Chosen: Add keys under existing `about.*` namespace**

New keys: `about.client`, `about.api`, `about.current`, `about.latest`. These are small, static labels. Use the same approach as existing keys.

## Risks / Trade-offs

- **Tile data and existing version sections may show inconsistent states** → Both derive from same reactive refs, so they stay in sync. Mitigation: all data flows from the same `frontendRelease`, `backendVersion`, `currentVersion` refs.
- **Tight coupling to AboutInfo.vue** → Acceptable because tiles are tightly scoped to the About page. If tiles are needed elsewhere later, extraction is straightforward.
- **New i18n keys need translation across ~20 locale files** → Only 4 new static keys; English values go into en-US.json and other locales can follow the existing pattern (some already untranslated).