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
                <SaltRimRadio v-model="importType" title="URL" description="Import from a supported website" value="url"></SaltRimRadio>
                <SaltRimRadio v-model="importType" title="JSON" description="Import from JSON format" value="json"></SaltRimRadio>
                <SaltRimRadio v-model="importType" title="YAML" description="Import from YAML format" value="yaml"></SaltRimRadio>
                <SaltRimRadio v-model="importType" title="Collection" description="Import from Bar Assistant JSON collection" value="collection"></SaltRimRadio>
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="import-source">{{ $t('source') }}:</label>
                <textarea id="import-source" v-model="source" class="form-input" rows="5" required></textarea>
            </div>
            <button type="button" class="button button--dark" @click.prevent="importCocktail">{{ $t('start-import') }}</button>
        </div>
        <div v-if="result" class="scraper-form">
            <div class="alert alert--info" style="margin: 1rem 0;">
                <h3>{{ $t('information') }}</h3>
                <p>{{ $t('scraper.information') }}</p>
            </div>
            <h3 class="form-section-title">{{ $t('recipe-information') }}</h3>
            <div class="block-container block-container--padded">
                <div class="form-group">
                    <label for="name">{{ $t('name') }}</label>
                    <input id="name" v-model="result.name" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label for="description">{{ $t('description') }}</label>
                    <textarea id="description" v-model="result.description" class="form-input" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label for="source">{{ $t('source') }}</label>
                    <input id="source" v-model="result.source" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label for="glass">{{ $t('glass-type') }}</label>
                    <input id="glass" v-model="result.glass" type="text" class="form-input">
                </div>
                <div class="form-group">
                    <label for="instructions">{{ $t('instructions') }}</label>
                    <textarea id="instructions" v-model="result.instructions" class="form-input" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label for="garnish">{{ $t('garnish') }}</label>
                    <textarea id="garnish" v-model="result.garnish" class="form-input" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="method">{{ $t('method') }}</label>
                    <input id="method" v-model="result.method" type="text" class="form-input">
                </div>
                <template v-for="image in result.images" :key="image.url">
                    <div class="form-group">
                        <label for="image_url">{{ $t('image-url') }}</label>
                        <input id="image_url" v-model="image.url" type="text" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="image_copyrigh">{{ $t('image-copyright') }}</label>
                        <input id="image_copyrigh" v-model="image.copyright" type="text" class="form-input">
                    </div>
                </template>
                <div class="form-group">
                    <label for="tags">{{ $t('tags') }}</label>
                    <input id="tags" v-model="cocktailTags" type="text" class="form-input">
                </div>
            </div>
            <h3 class="form-section-title">{{ $t('ingredients') }}</h3>
            <div v-for="(ingredient, idx) in result.ingredients" :key="idx" class="block-container block-container--padded scraper-ingredients__ingredient">
                <div class="scraper-ingredients__ingredient__inputs">
                    <div class="form-group">
                        <label :for="'ingredient_name_' + idx">{{ $t('name') }}</label>
                        <input :id="'ingredient_name_' + idx" v-model="ingredient.name" type="text" class="form-input">
                    </div>
                    <div class="form-group">
                        <label :for="'ingredient_amount_' + idx">{{ $t('amount') }}</label>
                        <input :id="'ingredient_amount_' + idx" v-model="ingredient.amount" type="text" class="form-input">
                    </div>
                    <div class="form-group">
                        <label :for="'ingredient_units_' + idx">{{ $t('units') }}</label>
                        <input :id="'ingredient_units_' + idx" v-model="ingredient.units" type="text" class="form-input">
                    </div>
                </div>
                <div class="scraper-ingredients__ingredient__actions">
                    <a href="#" @click.prevent="removeIngredient(ingredient)">{{ $t('remove') }}</a>
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
import ApiRequests from './../../ApiRequests.js'
import OverlayLoader from './../OverlayLoader.vue'
import PageHeader from './../PageHeader.vue'
import SaltRimRadio from '../SaltRimRadio.vue'

export default {
    components: {
        OverlayLoader,
        PageHeader,
        SaltRimRadio
    },
    data() {
        return {
            isLoading: false,
            importType: 'url',
            source: null,
            result: null,
        }
    },
    computed: {
        cocktailTags: {
            get() {
                return this.result.tags.map(i => i.name).join(',')
            },
            set(newVal) {
                if (Array.isArray(newVal)) {
                    newVal = newVal.join(',')
                }

                if (newVal == '' || newVal == null || newVal == undefined) {
                    this.result.tags = []
                } else {
                    this.result.tags = []
                    newVal.split(',').forEach(tagName => {
                        this.result.tags.push({ name: tagName })
                    })
                }
            }
        },
    },
    created() {
        document.title = `${this.$t('cocktails.import')} \u22C5 ${this.site_title}`
    },
    methods: {
        importCocktail() {
            this.isLoading = true
            ApiRequests.importCocktail({ source: this.source }, { type: this.importType }).then(data => {
                this.result = data
                this.cocktailTags = data.tags
                this.isLoading = false
                if (this.importType == 'collection') {
                    this.$router.push({ name: 'cocktails', query: { 'filter[collection_id]': this.result.id } })
                }
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            })
        },
        async matchIngredients() {
            for (const key in this.result.ingredients) {
                if (Object.hasOwnProperty.call(this.result.ingredients, key)) {
                    const scrapedIngredient = this.result.ingredients[key]
                    scrapedIngredient.substitutes = []
                    scrapedIngredient.sort = 1
                    scrapedIngredient.newIngredient = null

                    let dbIngredient = null
                    const possibleMatches = await ApiRequests.fetchIngredients({ 'filter[name_exact]': scrapedIngredient.name, 'per_page': 1 }).then(resp => resp.data).catch(() => { return [] })
                    if (possibleMatches.length > 0) {
                        dbIngredient = possibleMatches[0]
                    }

                    // Ingredient not found, try to create a new one
                    if (!dbIngredient) {
                        dbIngredient = await ApiRequests.saveIngredient({
                            name: scrapedIngredient.name,
                            description: scrapedIngredient.description || null,
                            strength: scrapedIngredient.strength || 0,
                            origin: scrapedIngredient.origin || null,
                            color: scrapedIngredient.color || null,
                            images: [],
                            ingredient_category_id: 1,
                        }).catch(() => { return null })
                    }

                    if (!dbIngredient) {
                        this.$toast.error(`Unable to create ingredient with name ${scrapedIngredient.name}.`)
                        continue
                    }

                    scrapedIngredient.ingredient_id = dbIngredient.id
                    scrapedIngredient.ingredient_slug = dbIngredient.slug
                    scrapedIngredient.name = dbIngredient.name
                }
            }
        },
        async matchGlass() {
            if (!this.result.glass) {
                this.result.glass = {}
                return
            }

            let dbGlass = await ApiRequests.fetchGlasses({ 'filter[name]': this.result.glass }).then(data => {
                if (data.length == 0) {
                    return null
                }

                return data[0]
            }).catch(() => { return null })

            if (!dbGlass) {
                dbGlass = await ApiRequests.saveGlass({ name: this.result.glass, description: null }).catch(() => { return null })
            }

            if (!dbGlass) {
                this.$toast.error(`Unable to create a glass with name ${this.result.glass}.`)
                this.result.glass = {}
                return
            }

            this.result.glass = {
                id: dbGlass.id
            }
        },
        async matchMethod() {
            if (!this.result.method) {
                this.result.method = {}
                return
            }

            const dbMethods = await ApiRequests.fetchCocktailMethods().catch(() => { return [] })
            let foundMethodId = null
            dbMethods.forEach(m => {
                if (this.result.method.toLowerCase().includes(m.name.toLowerCase())) {
                    foundMethodId = m.id
                }
            })

            if (!foundMethodId) {
                this.result.method = {}
                return
            }

            this.result.method = {
                id: foundMethodId
            }
        },
        removeIngredient(ingredient) {
            this.result.ingredients.splice(
                this.result.ingredients.findIndex(i => i == ingredient),
                1
            )
        },
        async goTo(routeName) {
            this.isLoading = true
            await this.matchGlass()
            await this.matchIngredients()
            await this.matchMethod()
            this.isLoading = false
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
    flex-basis: 250px;
}

.scraper-form .form-group :is(input, select, textarea) {
    flex-grow: 1;
    width: auto;
}

.scraper-ingredients__ingredient {
    margin-bottom: 1rem;
}

.scraper-ingredients__ingredient__inputs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
}

.scraper-ingredients__ingredient .form-group {
    margin-bottom: 0;
}
</style>
