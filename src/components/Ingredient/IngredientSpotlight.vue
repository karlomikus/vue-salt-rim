<template>
    <div class="block-container ingredient-spotlight-wrapper">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div class="ingredient-spotlight__image">
            <img :src="mainIngredientImageUrl" :alt="ingredient.name" />
        </div>
        <div class="ingredient-spotlight__content">
            <small>{{ ingredient.category.name }}</small>
            <h4>{{ ingredient.name }}</h4>
            <p>{{ truncatedDescription }}</p>
            <RouterLink :to="{name: 'ingredients.show', params: { id: ingredient.slug }}">{{ $t('show-more') }}</RouterLink>
        </div>
    </div>
</template>
<script>
import ApiRequests from '@/ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    props: {
        id: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            isLoading: false,
            ingredient: {
                category: {}
            },
        };
    },
    components: {
        OverlayLoader
    },
    computed: {
        truncatedDescription() {
            if (!this.ingredient.description) {
                return this.ingredient.description
            }

            return this.ingredient.description.length > 200 ? `${this.ingredient.description.substring(0, 200)}...` : this.ingredient.description;
        },
        mainIngredientImageUrl() {
            if (!this.ingredient.main_image_id) {
                return '/no-ingredient.png';
            }

            return this.ingredient.images.filter((img) => img.id == this.ingredient.main_image_id)[0].url;
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
        this.fetchIngredient();
    },
    methods: {
        fetchIngredient() {
            this.isLoading = true;
            ApiRequests.fetchIngredient(this.id).then(data => {
                this.ingredient = data
                this.isLoading = false;
            }).catch(() => {
                this.ingredient = {
                    category: {}
                }
                this.isLoading = false;
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
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1.2;
    font-family: var(--font-heading);
    margin-bottom: 0.5rem;
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
    font-size: 0.7rem;
}

.ingredient-spotlight__content p {
    font-size: 0.8rem;
}
</style>
