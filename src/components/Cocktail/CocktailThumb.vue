<template>
    <div class="cocktail-thumb">
        <img :src="mainCocktailImageUrl" alt="Smaller image of cocktail">
    </div>
</template>
<script>
import ApiRequests from '../../ApiRequests'

export default {
    props: {
        cocktail: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    computed: {
        mainCocktailImageUrl() {
            if (!this.cocktail.main_image_id && !this.cocktail.image_url) {
                return '/no-cocktail.jpg'
            }

            if (this.cocktail.image_url) {
                return this.cocktail.image_url
            }

            return ApiRequests.imageThumbUrl(this.cocktail.main_image_id)
        },
    }
}
</script>
<style scoped>
.cocktail-thumb {
    width: 50px;
    height: 50px;
    border-radius: var(--radius-1);
    overflow: hidden;
    flex-shrink: 0;
}

.cocktail-thumb img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}
</style>
