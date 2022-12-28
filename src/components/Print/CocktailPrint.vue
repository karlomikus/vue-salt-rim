<template>
    <div class="cocktail-print-container">
        <h1>{{ cocktail.name }}</h1>
        <template v-if="cocktail.description">
            <h2>Description:</h2>
            <p>{{ cocktail.description }}</p>
        </template>
        <div class="cocktail-print-image" v-if="cocktail.main_image_id">
            <img :src="cocktail.images[0].url" :alt="cocktail.images[0].copyright">
        </div>
        <div class="print-second-row">
            <div class="print-ingredients">
                <h2>Ingredients:</h2>
                <ul>
                    <li v-for="ingredient in cocktail.ingredients">
                        {{ ingredient.amount }} {{ ingredient.units }} &middot; {{ ingredient.name }}
                    </li>
                </ul>
            </div>
            <div class="print-instructions">
                <h2>Instructions:</h2>
                <p>{{ cocktail.instructions }}</p>
            </div>
        </div>
    </div>
</template>
<script>
import ApiRequests from '@/ApiRequests';

export default {
    data() {
        return {
            cocktail: {},
            printReady: false
        }
    },
    created() {
        ApiRequests.fetchCocktail(this.$route.params.id).then(data => {
            this.cocktail = data
            this.printReady = true
        }).catch(e => {
            this.$toast.error(e.message);
        })
    }
}
</script>

<style scoped>
.cocktail-print-container {
    color: #000;
    font-size: 1rem;
}

h1 {
    border-bottom: 3px double #333;
    text-align: center;
}

.print-second-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 30px;
}

.print-ingredients {
    border: 3px solid #333;
    padding: 20px;
}

.cocktail-print-image img {
    max-height: 300px;
    display: block;
    margin: 20px auto;
}
</style>
