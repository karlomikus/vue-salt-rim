# AGENTS.md - Development Guidelines

## Build & Development Commands

Application is run in a docker container with Bun as the runtime. Use the following commands to manage the application:

```bash
docker compose exec app bun run dev          # Start development server (Vite)
docker compose exec app bun run build        # Build for production
docker compose exec app bun run preview      # Preview production build on port 4173
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

### Formatting
- **Indentation**: 4 spaces (enforced by ESLint via `eslint.config.js`)
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing commas**: Follow ESLint rules
- Line length: No strict limit, but keep reasonable

### Naming Conventions
- **Components**: PascalCase (e.g., `AmountInput.vue`, `CocktailFinder.vue`)
- **Composables**: `useXxx.ts` pattern (e.g., `useUnits.ts`, `useRecommendedAmounts.ts`)
- **Views/Pages**: PascalCase in `views/` directory
- **TypeScript interfaces**: PascalCase, prefixed with component name when local
- **Test files**: `*.test.ts` in `__tests__` directories

### Component Structure
```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { unitHandler } from '@/composables/useUnits'

const model = defineModel<string | number | null>({ required: true })

// Props, refs, computed, methods in that order
</script>

<template>
  <!-- Template content -->
</template>
```

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
- Custom elements (Swiper) registered globally in `main.ts`

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

### CSS/Styling
- Plain CSS (no preprocessors)
- Styles in `src/assets/` organized by component type
- BEM-like naming conventions
- Dark theme supported via `.dark-theme` class on body
