<template>
    <div class="ingredient-details" v-if="ingredient.id">
        <div class="ingredient-details__image">
            <img :src="ingredient.image_url" :alt="ingredient.name">
        </div>
        <div class="ingredient-details__content">
            <div class="ingredient-details__content__box ingredient-details__content__box--blue" style="margin-top: 0;">
                <h2 class="ingredient-details__content__box__title">{{ ingredient.name }}</h2>
                <p>{{ ingredient.description }}</p>
                <hr>
                <p><strong>Strength:</strong> {{ ingredient.strength <= 0 ? 'Non-alcoholic' : ingredient.strength + '%' }}</p>
                <hr>
                <p><strong>Origin:</strong> {{ ingredient.origin ?? 'n/a' }}</p>
                <hr>
                <p><strong>Category:</strong> {{ ingredient.category.name }}</p>
            </div>
            <div class="ingredient-details__content__box ingredient-details__content__box--purple">
                <h2 class="ingredient-details__content__box__title">Used in {{ ingredient.cocktails.length }} cocktails:</h2>
                <ul>
                    <li v-for="cocktail in ingredient.cocktails">
                        <RouterLink :to="{name: 'cocktails.show', params: {id: cocktail.id}}">{{ cocktail.name }}</RouterLink>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from '../../ApiRequests';

const api = new ApiRequests();

export default {
    data: () => ({
        ingredient: {}
    }),
    created() {
        api.fetchIngredient(this.$route.params.id).then(data => {
            this.ingredient = data
        })
    }
}
</script>

<style scope>
.ingredient-details {
    display: flex;
}

.ingredient-details .ingredient-details__image {
    flex-shrink: 0;
    margin-right: 30px;
}

.ingredient-details .ingredient-details__image img {
    max-width: 250px;
    width: 100%;
}

.ingredient-details .ingredient-details__content {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.ingredient-details__content__box {
    background-color: #fff;
    padding: 20px 20px 40px 20px;
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    margin-top: -20px;
}

.ingredient-details__content__box__title {
    font-weight: 700;
    font-family: var(--font-accent);
    margin-bottom: 10px;
}

.ingredient-details__content__box hr {
    border: 0;
    border-top: 2px solid rgba(0, 0, 0, .1);
}

.ingredient-details__content__box p {
    margin: 5px 0;
    padding: 5px 0;
}

.ingredient-details__content__box.ingredient-details__content__box--blue {
    background-color: #e0eff9;
}
.ingredient-details__content__box.ingredient-details__content__box--purple {
    background-color: rgb(232, 228, 247);
}
</style>
