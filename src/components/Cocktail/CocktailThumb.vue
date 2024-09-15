<template>
    <div class="cocktail-thumb">
        <img :src="mainCocktailImageUrl" alt="Smaller image of cocktail">
    </div>
</template>
<script>
import BarAssistantClient from '@/api/BarAssistantClient';

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

            return BarAssistantClient.getImageThumbUrl(this.cocktail.main_image_id)
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
