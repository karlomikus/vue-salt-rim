<template>
    <div class="public-bar-details">
        <div class="public-bar-details__header">
            <div class="public-bar-details__header__logo">
                <div class="public-bar-details__header__logo__image">
                    <img v-if="image" :src="image" alt="">
                    <svg v-else xmlns="http://www.w3.org/2000/svg" fill="#201a2d" viewBox="0 0 512 512"><path fill-rule="evenodd" d="M20 0h472c11.046 0 20 8.954 20 20v472c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20V20C0 8.954 8.954 0 20 0Zm365.643 234.638H287.62L117.146 354.345H78.789V84.995h38.357L287.62 204.703h98.023V129.89H424v179.561h-38.357v-74.813Zm-230.14 52.523V152.179l-38.357-26.935v188.852l38.357-26.935Zm99.727 113.798H78.79v40.062h176.44v-40.062Z" clip-rule="evenodd"/></svg>
                </div>
                <div class="public-bar-details__header__logo__text">
                    <h2>{{ bar.name }}</h2>
                    <h3>{{ bar.subtitle || $t('public-bar.default-subtitle') }}</h3>
                </div>
            </div>
            <div class="public-bar-details__header__links">
                <RouterLink :to="{ name: 'public.cocktails.index', params: { barId: bar.slug } }">{{ $t('cocktail.cocktails') }}</RouterLink>
                <template v-if="bar.is_menu_enabled">
                    &middot;
                    <RouterLink :to="{name: 'public.menu.show', params: {barId: bar.slug}}">{{ $t('menu.title') }}</RouterLink>
                </template>
                &middot;
                <a href="/">{{ $t('public-bar.signin') }}</a>
            </div>
        </div>
        <div v-if="bar.description" class="public-bar-details__description block-container block-container--padded">
            <h3>{{ $t('public-bar.description-title') }}</h3>
            <div v-html="parsedDescription"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { components } from '@/api/api'
import { micromark } from 'micromark'

type Bar = components['schemas']['PublicBarResource']

const {
    bar,
} = defineProps<{
    bar: Bar
}>()

const parsedDescription = computed(() => {
    return bar.description ? micromark(bar.description) : ''
})

const image = computed(() => {
    return bar.images.length > 0 ? bar.images[0].url : null
})
</script>

<style scoped>
.public-bar-details {
    --bcr-default-gap: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0 auto;
    margin-bottom: 2rem;
}

.public-bar-details__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.public-bar-details__header h2 {
    font-size: 1.4em;
    font-weight: var(--fw-bold);
    font-family: var(--font-heading);
}

.public-bar-details__header h3 {
    font-size: 0.85em;
}

.public-bar-details__header__logo {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.public-bar-details__header__logo__image {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;

    .dark-theme & svg {
        fill: var(--clr-gray-100);
    }
}

.public-bar-details__header__logo__image img {
    width: 100%;
    height: auto;
}

.public-bar-details__description h3 {
    font-family: var(--font-heading);
    font-size: 1em;
    font-weight: bold;
    color: #8F4277;
    margin-bottom: .25rem;
}
</style>
