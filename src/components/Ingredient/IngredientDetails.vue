<script setup>
import OverlayLoader from './../OverlayLoader.vue'
import Dropdown from './../Dropdown.vue';
</script>

<template>
    <div class="ingredient-details" v-if="ingredient.id">
        <div class="ingredient-details__box ingredient-details__box--green" style="margin-top: 100px;">
            <div class="ingredient-details__box__content">
                <h2 class="ingredient-details__box__title">
                    <small>{{ ingredient.category.name }}</small>
                    {{ ingredient.name }}
                </h2>
                <p>{{ ingredient.description }}</p>
                <hr>
                <p>
                    <strong>Strength:</strong>
                    {{ ingredient.strength <= 0 ? 'Non-alcoholic' : ingredient.strength + '%' }}
                </p>
                <hr>
                <p><strong>Origin:</strong> {{ ingredient.origin ?? 'n/a' }}</p>
                <div>
                    <Dropdown>
                        <template v-slot:default="{toggleDropdown}">
                            <button type="button" class="button-circle" @click="toggleDropdown"><svg
                                    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path
                                        d="M12 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 14c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                                </svg></button>
                        </template>
                        <template #content>
                            <a class="dropdown-menu__item" :href="'/ingredients/form?id=' + ingredient.id">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path
                                        d="M6.414 16L16.556 5.858l-1.414-1.414L5 14.586V16h1.414zm.829 2H3v-4.243L14.435 2.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 18zM3 20h18v2H3v-2z" />
                                </svg>
                                Edit
                            </a>
                            <a class="dropdown-menu__item" href="#" @click.prevent="deleteIngredient">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path
                                        d="M7 4V2h10v2h5v2h-2v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6H2V4h5zM6 6v14h12V6H6zm3 3h2v8H9V9zm4 0h2v8h-2V9z" />
                                </svg>
                                Delete
                            </a>
                        </template>
                    </Dropdown>
                </div>
            </div>
            <img :src="ingredient.image_url" :alt="ingredient.name" />
        </div>
        <div class="ingredient-details__cocktails">
            <h2 class="ingredient-details__box__title">Used in {{ ingredient.cocktails.length }} cocktails:</h2>
            <ul>
                <li v-for="cocktail in ingredient.cocktails">
                    <RouterLink :to="{name: 'cocktails.show', params: {id: cocktail.slug}}">{{ cocktail.name }}
                    </RouterLink>
                </li>
            </ul>
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
    },
    methods: {
        deleteIngredient() {
            if (confirm('Are you sure you want to delete ingredient?')) {
                api.deleteIngredient(this.ingredient.id).then(resp => {
                    this.$toast.open({
                        message: `Ingredient "${this.ingredient.name}" successfully removed`
                    });
                    this.$router.push({ name: 'ingredients' })
                })
            }
        }
    }
}
</script>

<style scope>
.ingredient-details .ingredient-details__image {
    flex-shrink: 0;
    padding: 30px;
    background-color: #fff;
    border-radius: 30px;
}

.ingredient-details .ingredient-details__content {
    display: flex;
    flex-direction: column;
    width: 100%;
}

.ingredient-details__box {
    background-color: #fff;
    padding: 20px 20px 40px 20px;
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    margin-top: -20px;
    display: flex;
}

.ingredient-details__box img {
    max-width: 250px;
    max-height: 400px;
    display: block;
    margin-top: -100px;
}

.ingredient-details__box__content {
    width: 100%;
}

.ingredient-details__box__title {
    font-weight: 700;
    font-family: var(--font-accent);
    margin-bottom: 10px;
    line-height: 1.1rem;
}

.ingredient-details__box__title small {
    display: block;
    font-size: 0.8rem;
    color: var(--color-text-muted);
}

.ingredient-details__box hr {
    border: 0;
    border-top: 2px solid rgba(0, 0, 0, .1);
}

.ingredient-details__box p {
    margin: 5px 0;
    padding: 5px 0;
}

.ingredient-details__box.ingredient-details__box--green {
    background-color: var(--color-var-4);
}

.ingredient-details__cocktails {
    background-color: var(--color-var-1);
    padding: 20px 20px 40px 20px;
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    margin-top: -20px;
}

.ingredient-details__cocktails ul {
    list-style: none;
    padding: 0;
    margin: 30px 0 0 0;
}

.ingredient-details__cocktails ul li {
    margin-bottom: 10px;
}

.ingredient-details__cocktails ul li a {
    display: block;
    padding: 3px 10px;
    background-color: rgb(198, 215, 225);
}
</style>
