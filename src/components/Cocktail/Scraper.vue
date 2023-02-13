<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            Cocktail Scraper
        </PageHeader>
        <div class="form-group-import-input">
            <input class="form-input" type="url" id="import" v-model="url" placeholder="Enter recipe URL...">
            <button type="button" class="button button--input" @click.prevent="scrape">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 13H4v-2h8V4l8 8-8 8z"/></svg>
            </button>
        </div>
        <p class="form-input-hint">Bar Assistant will do it's best to find recipe information from the URL.</p>
        <div class="scraper-form" v-if="result">
            <div class="alert alert--info" style="margin: 1rem 0;">
                <h3>Information</h3>
                <p>Existing ingredients and glass will be matched by their name (case insensitive). If ingredient or glass does not exist, it will be created. Common units are automatically converted to "ml".</p>
            </div>
            <div class="form-group">
                <label for="name">Name</label><br>
                <input type="text" class="form-input" id="name" v-model="result.name">
            </div>
            <div class="form-group">
                <label for="description">Description</label><br>
                <textarea class="form-input" rows="2" id="description" v-model="result.description"></textarea>
            </div>
            <div class="form-group">
                <label for="source">Source</label><br>
                <input type="text" class="form-input" id="source" v-model="result.source">
            </div>
            <div class="form-group">
                <label for="glass">Glass name</label><br>
                <input type="text" class="form-input" id="glass" v-model="result.glass">
            </div>
            <div class="form-group">
                <label for="instructions">Instructions</label><br>
                <textarea class="form-input" rows="2" id="instructions" v-model="result.instructions"></textarea>
            </div>
            <div class="form-group">
                <label for="image_url">Image url</label><br>
                <input type="text" class="form-input" id="image_url" v-model="result.image.url">
            </div>
            <div class="form-group">
                <label for="image_copyrigh">Image copyright</label><br>
                <input type="text" class="form-input" id="image_copyrigh" v-model="result.image.copyright">
            </div>
            <div class="form-group">
                <label for="tags">Tags</label><br>
                <input type="text" class="form-input" id="tags" v-model="cocktailTags">
            </div>
            <hr>
            <div class="scraper-ingredients">
                <div class="scraper-ingredients__ingredient" v-for="(ingredient, idx) in result.ingredients">
                    <div class="form-group">
                        <label :for="'ingredient_name_' + idx">Name</label><br>
                        <input type="text" class="form-input" :id="'ingredient_name_' + idx" v-model="ingredient.name">
                    </div>
                    <div class="form-group">
                        <label :for="'ingredient_amount_' + idx">Amount</label><br>
                        <input type="text" class="form-input" :id="'ingredient_amount_' + idx" v-model="ingredient.amount">
                    </div>
                    <div class="form-group">
                        <label :for="'ingredient_units_' + idx">Units</label><br>
                        <input type="text" class="form-input" :id="'ingredient_units_' + idx" v-model="ingredient.units">
                    </div>
                    <div class="form-group">
                        <label :for="'ingredient_optional_' + idx">
                            <input type="checkbox" :id="'ingredient_optional_' + idx" :value="true" v-model="ingredient.optional">
                            Optional
                        </label>
                    </div>
                    <a href="#" @click.prevent="removeIngredient(ingredient)">Remove</a>
                </div>
            </div>
            <div class="form-actions">
                <RouterLink class="button button--outline" :to="{ name: 'cocktails' }">Cancel</RouterLink>
                <button type="button" class="button button--dark" @click="goTo('cocktails.form')">Continue with editing</button>
                <!-- <button type="button" class="button button--dark" @click="goTo">Import and save</button> -->
            </div>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'

export default {
    data() {
        return {
            isLoading: false,
            url: null,
            result: null
        };
    },
    components: {
        OverlayLoader,
        PageHeader,
    },
    created() {
        document.title = `Cocktail Scraping \u22C5 Salt Rim`
    },
    computed: {
        cocktailTags: {
            get() {
                return this.result.tags.join(',')
            },
            set(newVal) {
                if (newVal == '' || newVal == null || newVal == undefined) {
                    this.result.tags = []
                } else {
                    this.result.tags = newVal.split(',')
                }
            }
        },
    },
    methods: {
        scrape() {
            this.isLoading = true;
            ApiRequests.scrapeCocktail({url: this.url}).then(data => {
                this.result = data.result
                this.isLoading = false;
            }).catch(e => {
                this.isLoading = false;
                this.$toast.error(e.message);
            })
        },
        async matchIngredients() {
            for (const key in this.result.ingredients) {
                if (Object.hasOwnProperty.call(this.result.ingredients, key)) {
                    let scrapedIng = this.result.ingredients[key];
                    let dbIngredient = await ApiRequests.findIngredient({name: scrapedIng.name}).catch(() => { return null })

                    scrapedIng.substitutes = [];
                    scrapedIng.sort = 0;

                    // Ingredient not found, try to create a new one
                    if (!dbIngredient) {
                        dbIngredient = await ApiRequests.saveIngredient({
                            name: scrapedIng.name,
                            description: null,
                            strength: 0,
                            origin: null,
                            color: null,
                            images: [],
                            ingredient_category_id: 1,
                        }).catch(() => { return null })
                    }

                    if (!dbIngredient) {
                        this.$toast.error(`Unable to create ingredient with name ${scrapedIng.name}.`);
                        continue;
                    }

                    scrapedIng.ingredient_id = dbIngredient.id
                    scrapedIng.ingredient_slug = dbIngredient.slug
                    scrapedIng.name = dbIngredient.name
                }
            }
        },
        async matchGlass() {
            if (!this.result.glass) {
                return;
            }

            let dbGlass = await ApiRequests.findGlass({name: this.result.glass}).catch(() => { return null })

            if (!dbGlass) {
                dbGlass = await ApiRequests.saveGlass({name: this.result.glass, description: null}).catch(() => { return null })
            }

            if (!dbGlass) {
                this.$toast.error(`Unable to create a glass with name ${this.result.glass}.`);
                return;
            }

            delete this.result.glass
            this.result.glass_id = dbGlass.id
        },
        removeIngredient(ingredient) {
            this.result.ingredients.splice(
                this.result.ingredients.findIndex(i => i == ingredient),
                1
            );
        },
        async goTo(routeName) {
            this.isLoading = true;
            await this.matchGlass();
            await this.matchIngredients();
            this.isLoading = false;
            localStorage.setItem('scrapeResult', JSON.stringify(this.result))
            this.$router.push({ name: routeName })
        },
    }
}
</script>

<style scoped>
.scraper-form .form-group {
    display: flex;
    flex-wrap: wrap;
    padding: .5rem;
    margin: -2px 0 0 0;
}

.scraper-form .form-group label {
    flex-basis: 300px;
}
.scraper-form .form-group :is(input, select, textarea) {
    flex-grow: 1;
    width: auto;
}

.form-group-import-input {
    display: flex;
    gap: 1rem;
}

.scraper-ingredients__ingredient {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 1rem;
}
</style>
