# AGENTS.md - Development Guidelines

## Build & Development Commands

```bash
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build on port 4173
npm run lint         # Run ESLint on src/
npm run lint-fix     # Run ESLint with auto-fix
npm run type-check   # Run TypeScript type checking
npm run gen          # Generate API types from spec.yml
```

### Running Single Tests

```bash
npm run test src/composables/__tests__/useUnits.test.ts
npm run test -- --run src/composables/__tests__/useUnits.test.ts
```

Vitest supports filtering by filename pattern. Use `--run` flag to run once without watch mode.

## Code Style Guidelines

### TypeScript & Vue
- Use Composition API with `<script setup lang="ts">` for all Vue components
- TypeScript is required for all new code (`.ts` or `.vue` with `lang="ts"`)
- Use `@/` alias for imports from `src/` directory
- Path aliases defined in `tsconfig.json`: `@/*` → `./src/*`

### Imports
- Order: Vue/VueUse → Libraries → Local composables → Components → Types
- Group imports by source (external, internal, relative)
- Use named imports over default imports when possible

```typescript
import { ref, computed } from 'vue'
import { useFloating, offset, flip } from '@floating-ui/vue'
import { unitHandler } from '@/composables/useUnits'
import type { components } from '@/api/api'
```

### Formatting
- **Indentation**: 4 spaces (enforced by ESLint via `.zed/settings.json` and `eslint.config.js`)
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
- Generated types in `src/api/api.d.ts` (run `npm run gen` to regenerate)
- Import types: `import type { components } from '@/api/api'`

### CSS/Styling
- Plain CSS (no preprocessors)
- Styles in `src/assets/` organized by component type
- BEM-like naming conventions
- Dark theme supported via `.dark-theme` class on body
