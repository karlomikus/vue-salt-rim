<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <PageHeader>
            {{ $t('cocktails.import') }}
        </PageHeader>
        <h3 class="form-section-title">{{ $t('import-type') }}</h3>
        <div class="block-container block-container--padded">
            <div class="form-group">
                <label class="form-label form-label--required">{{ $t('type') }}:</label>
                <Radio title="URL" description="Import from a supported website" value="url" v-model="importType"></Radio>
                <Radio title="JSON" description="Import from JSON format" value="json" v-model="importType"></Radio>
                <Radio title="YAML" description="Import from YAML format" value="yaml" v-model="importType"></Radio>
                <Radio title="Collection" description="Import from Bar Assistant JSON collection" value="collection" v-model="importType"></Radio>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ $t('source') }}:</label>
                <textarea class="form-input" id="import-source" rows="5" v-model="source" required></textarea>
                <!-- <p class="form-input-hint">{{ $t('scraper.input-hint') }}</p> -->
            </div>
            <button type="button" class="button button--dark" @click.prevent="importCocktail">{{ $t('start-import') }}</button>
        </div>
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
                    <textarea class="form-input" rows="4" id="description" v-model="result.description"></textarea>
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
                    <textarea class="form-input" rows="4" id="instructions" v-model="result.instructions"></textarea>
                </div>
                <div class="form-group">
                    <label for="garnish">{{ $t('garnish') }}</label>
                    <textarea class="form-input" rows="3" id="garnish" v-model="result.garnish"></textarea>
                </div>
                <div class="form-group">
                    <label for="method">{{ $t('method') }}</label>
                    <input type="text" class="form-input" id="method" v-model="result.method">
                </div>
                <template v-for="image in result.images">
                    <div class="form-group">
                        <label for="image_url">{{ $t('image-url') }}</label>
                        <input type="text" class="form-input" id="image_url" v-model="image.url">
                    </div>
                    <div class="form-group">
                        <label for="image_copyrigh">{{ $t('image-copyright') }}</label>
                        <input type="text" class="form-input" id="image_copyrigh" v-model="image.copyright">
                    </div>
                </template>
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
import Radio from "../Radio.vue";

export default {
    data() {
        return {
            isLoading: false,
            importType: 'url',
            source: null,
            result: null,
        };
    },
    components: {
        OverlayLoader,
        PageHeader,
        Checkbox,
        Radio
    },
    created() {
        document.title = `Cocktail Scraping \u22C5 ${this.site_title}`
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
        importCocktail() {
            this.isLoading = true;
            ApiRequests.importCocktail({ source: this.source }, { type: this.importType }).then(data => {
                this.result = data
                this.isLoading = false;
                if (this.importType == 'collection') {
                    this.$router.push({ name: 'cocktails', query: { 'filter[collection_id]': this.result.id } })
                }
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
