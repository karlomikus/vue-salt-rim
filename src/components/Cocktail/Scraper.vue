<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            {{ $t('cocktails.add-from-url') }}
        </PageHeader>
        <div class="form-group-import-input">
            <input class="form-input form-input--red" type="url" id="import" v-model="url" :placeholder="$t('placeholder.scraper')" style="width: 100%;">
            <button type="button" class="button button--input" @click.prevent="scrape">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 13H4v-2h8V4l8 8-8 8z"/></svg>
            </button>
        </div>
        <p class="form-input-hint">{{ $t('scraper.input-hint') }}</p>
        <div class="scraper-form" v-if="result">
            <div class="alert alert--info" style="margin: 1rem 0;">
                <h3>{{ $t('information') }}</h3>
                <p>{{ $t('scraper.information') }}</p>
            </div>
            <h3 class="form-section-title">{{ $t('recipe-information') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label for="name">{{ $t('name') }}</label>
                    <input type="text" class="form-input" id="name" v-model="result.name">
                </div>
                <div class="form-group">
                    <label for="description">{{ $t('description') }}</label>
                    <textarea class="form-input" rows="2" id="description" v-model="result.description"></textarea>
                </div>
                <div class="form-group">
                    <label for="source">{{ $t('source') }}</label>
                    <input type="text" class="form-input" id="source" v-model="result.source">
                </div>
                <div class="form-group">
                    <label for="glass">{{ $t('glass-type') }}</label>
                    <input type="text" class="form-input" id="glass" v-model="result.glass">
                </div>
                <div class="form-group">
                    <label for="instructions">{{ $t('instructions') }}</label>
                    <textarea class="form-input" rows="2" id="instructions" v-model="result.instructions"></textarea>
                </div>
                <div class="form-group">
                    <label for="image_url">{{ $t('image-url') }}</label>
                    <input type="text" class="form-input" id="image_url" v-model="result.image.url">
                </div>
                <div class="form-group">
                    <label for="image_copyrigh">{{ $t('image-copyright') }}</label>
                    <input type="text" class="form-input" id="image_copyrigh" v-model="result.image.copyright">
                </div>
                <div class="form-group">
                    <label for="tags">{{ $t('tags') }}</label>
                    <input type="text" class="form-input" id="tags" v-model="cocktailTags">
                </div>
            </div>
            <h3 class="form-section-title">{{ $t('ingredients') }}</h3>
            <div class="block-container block-container--padded">
                <div class="scraper-ingredients__ingredient" v-for="(ingredient, idx) in result.ingredients">
                    <div class="form-group">
                        <label :for="'ingredient_name_' + idx">{{ $t('name') }}</label>
                        <input type="text" class="form-input" :id="'ingredient_name_' + idx" v-model="ingredient.name">
                    </div>
                    <div class="form-group">
                        <label :for="'ingredient_amount_' + idx">{{ $t('amount') }}</label>
                        <input type="text" class="form-input" :id="'ingredient_amount_' + idx" v-model="ingredient.amount">
                    </div>
                    <div class="form-group">
                        <label :for="'ingredient_units_' + idx">{{ $t('units') }}</label>
                        <input type="text" class="form-input" :id="'ingredient_units_' + idx" v-model="ingredient.units">
                    </div>
                    <div class="form-group">
                        <Checkbox v-model="ingredient.optional" :id="'ingredient_optional_' + idx">{{ $t('optional') }}</Checkbox>
                    </div>
                    <div class="form-group">
                        <a href="#" @click.prevent="removeIngredient(ingredient)">{{ $t('remove') }}</a>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <RouterLink class="button button--outline" :to="{ name: 'cocktails' }">{{ $t('cancel') }}</RouterLink>
                <button type="button" class="button button--dark" @click="goTo('cocktails.form')">{{ $t('scraper.continue') }}</button>
            </div>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Checkbox from '@/components/Checkbox.vue'

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
        Checkbox
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

                    const dbIngredients = await ApiRequests.fetchIngredients({"filter[name_exact]": scrapedIng.name, "per_page": 1}).catch(() => { return null })
                    let dbIngredient = null;
                    if (dbIngredients.length > 0) {
                        dbIngredient = dbIngredients[0];
                    }

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
    flex-direction: row;
    flex-wrap: wrap;
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
    gap: 0.5rem;
}
</style>
