---
name: vue3-architecture
description: Generate Vue 3 Composition API code following this project's functional-core/imperative-shell architecture. Use for new features, components, composables, or API endpoints.
---

# Vue 3 Architecture — Functional Core, Imperative Shell

## When to Use This Skill

Use this skill whenever the user asks you to:
- Create a new feature, component, view, or composable
- Add a new API endpoint integration
- Refactor existing code to match the project's architecture
- Wire up a new data flow (API → state → UI)

## Architecture Overview

This project follows a **functional core, imperative shell** pattern with four layers:

```
┌─────────────────────────────────────────┐
│  Views (src/views/)                     │  Ultra-thin: imports a component,
│  Route orchestration only               │  wraps in <main>, nothing more
├─────────────────────────────────────────┤
│  Smart Components (src/components/)     │  Imports composables, wires state
│  Orchestration + lifecycle + handlers   │  to templates via event handlers
├─────────────────────────────────────────┤
│  Composables (src/composables/)         │  Functional core: ref/reactive/
│  Reactive state, readonly exposure,     │  computed with explicit mutation
│  error handling, loading state          │  methods. NO raw DOM access.
├─────────────────────────────────────────┤
│  API Client (src/api/)                  │  Imperative shell: raw HTTP via
│  + AppState (src/AppState.ts)           │  openapi-fetch. Type-safe, has
│  Side effects: network, localStorage    │  middleware (auth, error, bar-id)
└─────────────────────────────────────────┘
```

### Key Principles

1. **Readonly exposure**: Composables expose state as `readonly(ref)` — mutations only happen through explicit method calls, never by direct assignment from consumers.
2. **Smart components orchestrate**: Components import composables and `AppState`, handle `onMounted`, wire event handlers to composable methods. They never call `BarAssistantClient` directly.
3. **Views are shells**: Views only import a smart component and render it. No data fetching, no composables, no lifecycle hooks.
4. **API client is imperative shell**: `BarAssistantClient` has zero reactive state. It's a static class of pure async functions that do I/O.
5. **AppState is plain class (not Pinia)**: `AppState` extends `class` with localStorage persistence, accessed via `useAppState()` singleton composable.

## Step-by-Step Workflow for New Features

When building a new feature, execute in this exact order:

### Step 1: Identify Domain Placement

Determine where the files live:
- **API methods** → `src/api/BarAssistantClient.ts` (add static methods)
- **Reactive logic** → `src/composables/<domain>/use<Feature>.ts` (new composable)
- **Orchestration** → `src/components/<Domain>/<Feature>.vue` (smart component)  
- **View shell** → `src/views/<Feature>View.vue` (if it's a new route)

### Step 2: TypeScript Types

Types come from the generated API schema (`src/api/api.d.ts`). Import with:
```typescript
import type { components } from '@/api/api';
export type SomeType = components['schemas']['SomeType'];
```
If new types are needed beyond the API schema, define them in the composable file alongside the imported types.

### Step 3: API Client (Imperative Shell)

Add static methods to `BarAssistantClient`. Each method:
- Uses `client.VERB()` from `openapi-fetch` (already configured)
- Returns raw `data` from the response
- Has zero reactive state
- For POST that creates: extract ID from `Location` header via `extractIdFromLocationHeader`

```typescript
static async getSomething(query = {}) {
    return (await client.GET('/something', { params: { query } })).data;
}

static async saveSomething(body: components['schemas']['SomethingRequest']) {
    const { response } = await client.POST('/something', { body, parseAs: 'stream' });
    return extractIdFromLocationHeader(response);
}

static async deleteSomething(id: number) {
    return (await client.DELETE('/something/{id}', { params: { path: { id } } })).data;
}
```

### Step 4: Composable (Functional Core)

Create `src/composables/<domain>/use<Feature>.ts`. Every composable follows this template:

```typescript
import { ref, readonly, computed } from 'vue';
import BarAssistantClient from '@/api/BarAssistantClient';
import type { components } from '@/api/api';
import { useSaltRimToast } from '@/composables/toast';
import { useI18n } from 'vue-i18n';

export type SomeType = components['schemas']['SomeType'];

export function useSomeFeature() {
    // Reactive state
    const items = ref<SomeType[]>([]);
    const isLoading = ref(false);
    
    // Dependencies
    const toast = useSaltRimToast();
    const { t } = useI18n();

    // Mutations (the ONLY way state changes)
    async function fetchItems() {
        isLoading.value = true;
        try {
            items.value = (await BarAssistantClient.getSomething())?.data || [];
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteItem(id: number) {
        isLoading.value = true;
        try {
            await BarAssistantClient.deleteSomething(id);
            items.value = items.value.filter(item => item.id !== id);
            toast.default(t('domain.delete-success'));
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            isLoading.value = false;
        }
    }

    // Derived state
    const activeItems = computed(() => items.value.filter(i => i.status === 'active'));

    // Return: readonly state + mutation methods
    return {
        items: readonly(items),
        isLoading: readonly(isLoading),
        activeItems,
        fetchItems,
        deleteItem,
    };
}
```

**Critical rules for composables:**
- Expose state as `readonly(ref)` — consumers cannot mutate directly
- All mutations happen through named async functions
- Use try/catch with toast for error feedback
- Import `useI18n` for translatable strings via `t()`
- Put composable in a subdirectory matching the domain (e.g., `composables/bar/useBars.ts`)
- The only time it is perfectly acceptable to expose a fully mutable ref from a composable is when writing a utility specifically designed to manage ephemeral, isolated form state (e.g., a useForm validation utility).

### Step 5: Smart Component (Orchestration)

Create `src/components/<Domain>/<Feature>.vue`. This is the orchestration layer:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSomeFeature } from '@/composables/domain/useSomeFeature';
import { useAppState } from '@/composables/useAppState';
import { useConfirm } from '@/composables/confirm';
import { useSaltRimToast } from '@/composables/toast';
import ChildPresentationalComponent from '@/components/Domain/ChildPresentational.vue';

// Composables
const { t } = useI18n();
const appState = useAppState();
const toast = useSaltRimToast();
const confirm = useConfirm();
const { items, isLoading, fetchItems, deleteItem } = useSomeFeature();

// Local refs
const showDialog = ref(false);

// Lifecycle
onMounted(() => {
    fetchItems();
});

// Event handlers — these call composable methods, never BarAssistantClient directly
function handleDelete(id: number) {
    confirm.show(t('domain.confirm-delete'), {
        onResolved: async (dialog: { close: () => void }) => {
            await deleteItem(id);
            dialog.close();
        },
    });
}
</script>

<template>
    <PageHeader>{{ t('domain.title') }}</PageHeader>
    <div>
        <OverlayLoader v-if="isLoading" />
        <ChildPresentational 
            v-for="item in items" 
            :key="item.id" 
            :item="item"
            @delete="handleDelete(item.id)" 
        />
    </div>
</template>
```

**Critical rules for smart components:**
- Import composables and AppState — never call `BarAssistantClient` directly
- Handle `onMounted` to trigger initial data fetch
- Wire event handlers to composable methods
- Use `useConfirm()` for destructive actions
- Use `useSaltRimToast()` only via composable methods (already handled inside composable)
- Form submission handlers: optimistic updates are OK, but revert on API failure

### Step 6: View Shell

Create `src/views/<Feature>View.vue`. This is always ultra-thin:

```vue
<script setup lang="ts">
import FeatureComponent from '@/components/Domain/Feature.vue';
</script>

<template>
    <main>
        <FeatureComponent />
    </main>
</template>
```

**Views must:**
- Only import and render one smart component
- Never import composables, AppState, or API client
- Never have `onMounted` or lifecycle hooks
- Never fetch data

## File Naming Conventions

| Layer | Pattern | Example |
|---|---|---|
| API client methods | camelCase verbs | `getBars()`, `saveBar()`, `deleteBar()` |
| Composables | `use<Feature>.ts` | `useBars.ts`, `useAuth.ts` |
| Smart components | PascalCase `.vue` | `BarIndex.vue`, `CocktailRecipeCard.vue` |
| Views | PascalCase + `View` suffix | `BarsView.vue`, `CocktailsFormView.vue` |
