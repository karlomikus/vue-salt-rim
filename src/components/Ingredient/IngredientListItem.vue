<template>
    <div class="block-container block-container--hover ingredient-list-item">
        <OverlayLoader v-if="isLoading" />
        <div class="ingredient-list-item__image" :style="{ 'background-color': setupColor(ingredient.color) }">
            <img :src="mainIngredientImageUrl" :alt="ingredient.name">
        </div>
        <div class="ingredient-list-item__content">
            <h4 class="ingredient-list-item__title">
                <RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">{{ ingredient.name }}</RouterLink>
            </h4>
            <slot name="content">
                <a href="#" @click.prevent="addToShelf">{{ $t('add-to-shelf') }}</a> &middot;
                <a href="#" @click.prevent="removeFromShoppingList">{{ $t('remove-from-list') }}</a>
            </slot>
        </div>
    </div>
</template>

<script>
import ApiRequests from '../../ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue';

export default {
    props: ['ingredient'],
    data() {
        return {
            isLoading: false
        }
    },
    components: {
        OverlayLoader
    },
    computed: {
        mainIngredientImageUrl() {
            if (!this.ingredient.main_image_id) {
                return '/no-ingredient.png';
            }

            return this.ingredient.images.filter((img) => img.id == this.ingredient.main_image_id)[0].url;
        }
    },
    methods: {
        setupColor(hex) {
            var c;
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('');
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c = '0x' + c.join('');
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',.13)';
            }

            return hex;
        },
        addToShelf() {
            this.isLoading = true;
            ApiRequests.addIngredientToShelf(this.ingredient.id).then(() => {
                this.$emit('addedToShelf')
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false;
            })
        },
        removeFromShoppingList() {
            this.isLoading = true;
            ApiRequests.removeIngredientsFromShoppingList({ ingredient_ids: [this.ingredient.id] }).then(() => {
                this.$emit('removedFromShoppingList')
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false;
            })
        }
    }
}
</script>
<style scoped>
.ingredient-list-item {
    --image-size: 70px;
    --ili-clr-content: var(--clr-gray-500);

    display: flex;
    align-items: center;
    padding: 0.825rem;
    text-decoration: none;
    gap: 10px;
}

.dark-theme .ingredient-list-item {
    --ili-clr-content: var(--clr-gray-300);
}

.ingredient-list-item__image {
    width: 70px;
    height: 70px;
    border-radius: 5px;
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
