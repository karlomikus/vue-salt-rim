<script setup lang="ts">
import { computed } from "vue";
import { useIngredientBg } from "@/composables/ingredientBg";

const props = withDefaults(
    defineProps<{
        name: string;
        imageUrl?: string | null;
        color?: string | null;
        subtitle?: string | null;
        imageAlt?: string;
    }>(),
    {
        imageUrl: null,
        color: null,
        subtitle: null,
        imageAlt: undefined,
    },
);

const backgroundColor = computed(() => useIngredientBg(props.color ?? "#ffffff"));
const resolvedImageUrl = computed(() => props.imageUrl ?? "/no-ingredient.png");
const resolvedImageAlt = computed(() => props.imageAlt ?? `${props.name} ingredient`);
</script>

<template>
    <article class="ingredient-card" :style="{ '--ingredient-card-bg': backgroundColor }">
        <div class="ingredient-card__backdrop" aria-hidden="true"></div>
        <img class="ingredient-card__image" :src="resolvedImageUrl" :alt="resolvedImageAlt" loading="lazy" />

        <div class="ingredient-card__content">
            <h3 class="ingredient-card__title">{{ name }}</h3>
            <p v-if="subtitle" class="ingredient-card__subtitle">{{ subtitle }}</p>
        </div>
    </article>
</template>

<style scoped>
.ingredient-card {
    min-height: 14rem;
    border-radius: var(--radius-2);
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    isolation: isolate;
    /*background: linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0) 45%);
    box-shadow: var(--shadow-elevation-medium);*/
}

.dark-theme .ingredient-card {
    box-shadow: var(--shadow-elevation-medium-dark);
}

.ingredient-card__backdrop,
.ingredient-card__gradient {
    position: absolute;
    inset: 0;
    border-radius: inherit;
}

.ingredient-card__backdrop {
    margin-top: auto;
    height: 65%;
    background-color: var(--ingredient-card-bg);
}

.ingredient-card__image {
    position: absolute;
    left: 50%;
    top: 0.9rem;
    transform: translateX(-50%);
    width: auto;
    max-width: 56%;
    max-height: 68%;
    object-fit: contain;
    filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.18));
}

.ingredient-card__gradient {
    background: linear-gradient(180deg, rgba(13, 10, 12, 0) 35%, rgba(13, 10, 12, 0.9) 100%);
}

.ingredient-card__content {
    width: 100%;
    z-index: 1;
    padding: var(--gap-size-3);
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-1);
    color: #fff;
}

.ingredient-card__title {
    font-family: var(--font-heading);
    font-size: 1.25em;
    font-weight: var(--fw-bold);
    line-height: 1.2;
    text-wrap: balance;
}

.ingredient-card__subtitle {
    font-size: 0.85em;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.88);
}

.ingredient-card__title,
.ingredient-card__subtitle {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.ingredient-card__title {
    -webkit-line-clamp: 2;
}

.ingredient-card__subtitle {
    -webkit-line-clamp: 3;
}

@media (max-width: 545px) {
    .ingredient-card {
        min-height: 14rem;
        border-radius: var(--radius-2);
    }

    .ingredient-card__image {
        max-width: 60%;
        max-height: 64%;
    }

    .ingredient-card__backdrop {
        inset: 14% 22% auto;
        height: 40%;
    }

    .ingredient-card__content {
        padding: var(--gap-size-3);
    }

    .ingredient-card__title {
        font-size: 1.25rem;
    }
}
</style>
