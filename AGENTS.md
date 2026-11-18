# AGENTS.md - Development Guidelines

## Build & Development Commands

Application is run in a docker container with Bun as the runtime. Use the following commands to manage the application:

```bash
docker compose exec app bun run lint         # Run oxlint + ESLint (both include --fix)
docker compose exec app bun run type-check   # Run TypeScript type checking
docker compose exec app bun run gen          # Generate API types from spec.yml
docker compose exec app bun run test:unit    # Run Vitest unit tests
```

**Note:** There is no `lint-fix` script — the `lint` script already applies fixes. CI runs `bun run test` but the package.json only defines `test:unit`.

## Code Style Guidelines

### TypeScript & Vue
- Use Composition API with `<script setup lang="ts">` for all Vue components
- TypeScript is required for all new code (`.ts` or `.vue` with `lang="ts"`)
- Use `@/` alias for imports from `src/` directory
- Path aliases defined in `tsconfig.json`: `@/*` → `./src/*`

### Naming Conventions
- **Components**: PascalCase (e.g., `AmountInput.vue`, `CocktailFinder.vue`)
- **Composables**: `useXxx.ts` pattern (e.g., `useUnits.ts`, `useRecommendedAmounts.ts`)
- **Views/Pages**: PascalCase in `views/` directory
- **TypeScript interfaces**: PascalCase, prefixed with component name when local
- **Test files**: `*.test.ts` in `__tests__` directories

### Error Handling
- Use try/catch for async operations
- Silent failures for non-critical errors (ESLint rule: `no-unused-expressions` off)
- TypeScript strict null checks enabled
- Avoid `any` type (ESLint rule turned off but still discouraged)

### Vue Specifics
- Use `v-on` shorthand `@` for event listeners
- Use `v-bind` shorthand `:` for bindings
- Component tags: PascalCase in templates
- Use `defineModel` for v-model support (Vue 3.4+)

### State Management
- Use `AppState` class for global app state (src/AppState.ts)
- Pinia not used; prefer composables for local state
- VueUse library available for common composables

### i18n
- Vue I18n with legacy: false (composition API)
- Locale files in `src/locales/`

### Testing
- Test framework: Vitest
- Test files in `src/**/__tests__/` directories
- Import: `import { expect, test } from 'vitest'`
- Test composables by importing and testing exported functions/objects

### API Client
- Uses `openapi-fetch` for type-safe API calls
- Generated types in `src/api/api.d.ts` (run `bun run gen` to regenerate)
- Import types: `import type { components } from '@/api/api'`

## Browser Testing with agent-browser

The dev client runs on `http://localhost:5173` (docker container) with the API on `http://localhost:8000`. Use the `agent-browser` CLI to test the app with a real browser.

### Setup (once per run)

```bash
SR_ADMIN_EMAIL="..." SR_ADMIN_PASSWORD="..." ./scripts/agent-login.sh
```

The script requires `SR_ADMIN_EMAIL` and `SR_ADMIN_PASSWORD` env vars pointing at an existing admin account on the local backend. It performs a real UI login (fills `#email` / `#password`, clicks `button[type=submit]`) and prints the agent-browser session name to export for subsequent commands.

- Auth is a Sanctum bearer token stored in `localStorage` under `_salt_rim` (full `AppState`), so the session persists via `agent-browser --restore`.
- On later runs the script short-circuits when the stored token is still valid — it only re-logs in if the token is missing or expired.
- **The backend rate-limits login to ~5 attempts per window.** Never brute-force credentials; the script's short-circuit exists to avoid burning attempts.

### Testing loop

```bash
export AGENT_BROWSER_SESSION="salt-rim-<worktree-hash>"  # printed by agent-login.sh
agent-browser open http://localhost:5173
agent-browser snapshot -i          # accessibility tree with @eN refs
agent-browser click @e1            # act on refs
agent-browser snapshot -i          # re-snapshot after every change
agent-browser errors               # check console errors
```

- Use `#email`, `#password`, `button[type=submit]` selectors for the login form — button labels are i18n-translated, so don't match on text.
- After login the app redirects to `/` (single bar) or `/bars` (multiple bars).
- Prefer `agent-browser eval --stdin` with a heredoc for any JS with quotes or special characters.

### CSS/Styling
- Plain CSS (no preprocessors)
- Styles in `src/assets/` organized by component type
- BEM-like naming conventions
- Dark theme supported via `.dark-theme` class on body
- Prefer new nested CSS selectors via `&`
