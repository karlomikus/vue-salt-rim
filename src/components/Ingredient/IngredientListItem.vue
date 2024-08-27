<template>
    <div class="block-container block-container--hover ingredient-list-item">
        <div v-if="showImage" class="ingredient-list-item__image" :style="{ 'background-color': setupColor(ingredient.color) }">
            <img :src="mainIngredientImageUrl" :alt="ingredient.name">
        </div>
        <div class="ingredient-list-item__content">
            <h4 class="ingredient-list-item__title">
                <RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">{{ ingredient.name }}</RouterLink>
            </h4>
            <slot name="content">
                <ToggleIngredientShelf :ingredient="ingredient" :status="ingredient.in_shelf"></ToggleIngredientShelf>
                &middot;
                <ToggleIngredientShoppingCart :ingredient="ingredient" :status="ingredient.in_shopping_list"></ToggleIngredientShoppingCart>
            </slot>
        </div>
    </div>
</template>

<script>
import ApiRequests from './../../ApiRequests'
import ToggleIngredientShoppingCart from '@/components/ToggleIngredientShoppingCart.vue'
import ToggleIngredientShelf from '@/components/ToggleIngredientShelf.vue'

export default {
    components: {
        ToggleIngredientShoppingCart,
        ToggleIngredientShelf,
    },
    props: {
        ingredient: {
            type: Object,
            default() {
                return {}
            }
        },
        showImage: {
            type: Boolean,
            default: true
        }
    },
    computed: {
        mainIngredientImageUrl() {
            if (!this.ingredient.images || this.ingredient.images.length == 0) {
                return '/no-ingredient.png'
            }

            return ApiRequests.imageThumbUrl(this.ingredient.images.find(i => i.sort <= 1).id)
        }
    },
    methods: {
        setupColor(hex) {
            var c
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('')
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]]
                }
                c = '0x' + c.join('')
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',.13)'
            }

            return hex
        },
    }
}
</script>
<style scoped>
.ingredient-list-item {
    --image-size: 70px;
    --ili-clr-content: var(--clr-gray-500);

    display: flex;
    align-items: center;
    padding: 0.75rem;
    text-decoration: none;
    gap: var(--gap-size-2);
}

.dark-theme .ingredient-list-item {
    --ili-clr-content: var(--clr-gray-300);
}

.ingredient-list-item__image {
    width: 70px;
    height: 70px;
    border-radius: var(--radius-2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    background-color: #fff;
}

.dark-theme .ingredient-list-item__image {
    background-color: var(--clr-dark-main-800);
}

.ingredient-list-item img {
    height: 100px;
    position: absolute;
    top: 10px;
    transition: top ease-in-out .1s;
}

.ingredient-list-item:hover img {
    top: 5px;
}

.ingredient-list-item__title a {
    text-decoration: none;
    font-size: 1.1rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
}

.ingredient-list-item__content p {
    color: var(--ili-clr-content);
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
