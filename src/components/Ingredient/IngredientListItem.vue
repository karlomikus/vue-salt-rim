<template>
    <div class="ingredient-list-item">
        <OverlayLoader v-if="isLoading" />
        <div class="ingredient-list-item__image" :style="{ 'background-color': setupColor(ingredient.color) }">
            <img :src="mainIngredientImageUrl" :alt="ingredient.name">
        </div>
        <div class="ingredient-list-item__content">
            <h3><RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">{{ ingredient.name }}</RouterLink></h3>
            <!-- <p>{{ ingredient.description }}</p> -->
            <a href="#" @click.prevent="addToShelf">Add to my shelf</a> &middot;
            <a href="#" @click.prevent="removeFromShoppingList">Remove from list</a>
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
            })
        },
        removeFromShoppingList() {
            this.isLoading = true;
            ApiRequests.removeIngredientsFromShoppingList({ingredient_ids: [this.ingredient.id]}).then(() => {
                this.$emit('removedFromShoppingList')
                this.isLoading = false;
            })
        }
    }
}
</script>
<style scoped>
.ingredient-list-item {
    display: flex;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 3px 0 var(--color-bg-dark);
    transition: box-shadow ease-in-out 150ms;
    text-decoration: none;
    gap: 10px;
}

.ingredient-list-item:hover {
    box-shadow: 0 3px 0 var(--color-link-hover);
}

.ingredient-list-item__image {
    width: 60px;
    height: 60px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
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

.ingredient-list-item__content h3 a {
    text-decoration: none;
    font-size: 1.2rem;
    font-family: var(--font-accent);
    font-weight: 700;
}

.ingredient-list-item__content p {
    color: var(--color-text-muted);
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
