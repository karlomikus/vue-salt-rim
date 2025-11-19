<template>
    <div class="block-container ingredient-spotlight-wrapper">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="ingredient-spotlight__image">
            <img :src="mainIngredientImageUrl" :alt="ingredient.name" />
        </div>
        <div class="ingredient-spotlight__content">
            <small v-if="ingredient.hierarchy && ingredient.hierarchy.path_to_self">{{ ingredient.hierarchy.path_to_self }}</small>
            <h4 class="sr-list-item-title">{{ ingredient.name }}</h4>
            <p>{{ truncatedDescription }}</p>
            <RouterLink :to="{name: 'ingredients.show', params: { id: ingredient.slug }}">{{ $t('show-more') }}</RouterLink>
        </div>
    </div>
</template>
<script>
import BarAssistantClient from '@/api/BarAssistantClient';
import OverlayLoader from '@/components/OverlayLoader.vue'
import removeMd from 'remove-markdown'

export default {
    components: {
        OverlayLoader
    },
    props: {
        id: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            isLoading: false,
            ingredient: {},
        }
    },
    computed: {
        truncatedDescription() {
            if (!this.ingredient.description) {
                return this.ingredient.description
            }

            const doc = new DOMParser().parseFromString(this.ingredient.description, "text/html");
            const description = removeMd(doc.documentElement.textContent)

            return description.length > 200 ? `${description.substring(0, 200)}...` : description
        },
        mainIngredientImageUrl() {
            if (!this.ingredient.images || this.ingredient.images.length == 0) {
                return '/no-ingredient.png'
            }

            return this.ingredient.images.find(i => i.sort <= 1).url
        }
    },
    watch: {
        id(newVal, oldVal) {
            if (newVal != oldVal) {
                this.fetchIngredient()
            }
        }
    },
    created() {
        this.fetchIngredient()
    },
    methods: {
        fetchIngredient() {
            this.isLoading = true
            BarAssistantClient.getIngredient(this.id).then(resp => {
                this.ingredient = resp.data
                this.isLoading = false
            }).catch(() => {
                this.ingredient = {}
                this.isLoading = false
            })
        },
    }
}
</script>
<style scoped>
.ingredient-spotlight-wrapper {
    display: flex;
}

.ingredient-spotlight-wrapper h4 {
    margin-top: -2px;
    margin-bottom: var(--gap-size-1);
}

.ingredient-spotlight-wrapper p {
    line-height: 1.4;
    color: var(--clr-gray-700);
}

.ingredient-spotlight__image {
    flex-shrink: 0;
    padding: 1rem 0 1rem 1rem;
}

.ingredient-spotlight__image img {
    max-width: 60px;
}

.ingredient-spotlight__content {
    padding: 1rem;
}

.ingredient-spotlight__content small {
    font-size: 0.75rem;
    line-height: 1.4;
    display: inline-block;
    color: var(--clr-gray-700);
}
</style>
