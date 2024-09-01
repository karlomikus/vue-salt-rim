<template>
    <div class="public-page">
        <div class="public-page__header">
            <SiteLogo :bar-name="barName" :bar-subtitle="barSubtitle"></SiteLogo>
        </div>
        <PublicRecipe :cocktail="cocktail"></PublicRecipe>
        <div class="public-footer">
            Powered by <a href="https://barassistant.app">Bar Assistant</a>
            <template v-if="cocktail.source">
                &middot; <SourcePresenter :source="cocktail.source"></SourcePresenter>
            </template>
            <!-- &middot; <a href="#">Add to your bar</a> &middot; <a href="#">Print</a> -->
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests'
import SiteLogo from '@/components/Layout/SiteLogo.vue'
import PublicRecipe from '@/components/Cocktail/PublicRecipe.vue'
import SourcePresenter from '../SourcePresenter.vue'
import { useTitle } from '@/composables/title';

export default {
    components: {
        SiteLogo,
        PublicRecipe,
        SourcePresenter
    },
    data() {
        return {
            isLoading: false,
            cocktail: {},
        }
    },
    computed: {
        barName() {
            if (this.cocktail.bar) {
                return this.cocktail.bar.name
            }

            return null
        },
        barSubtitle() {
            if (this.cocktail.bar) {
                return this.cocktail.bar.subtitle
            }

            return null
        }
    },
    watch: {
        cocktail(val) {
            useTitle(val.name)
        }
    },
    created() {
        useTitle('Cocktail')
        this.$watch(
            () => this.$route.params,
            () => {
                if (this.$route.name == 'e.cocktail') {
                    this.getCocktail(this.$route.params.ulid)
                }
            },
            { immediate: true }
        )
    },
    mounted() {
        document.body.classList.add('public-body')
    },
    unmounted() {
        document.body.classList.remove('public-body')
    },
    methods: {
        getCocktail(ulid) {
            this.isLoading = true
            ApiRequests.fetchCocktailByPublicId(ulid).then(data => {
                this.cocktail = data
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
    }
}
</script>

<style scoped>
.public-page__header {
    padding: 2rem 0;
}

.public-page {
    align-items: center;
    justify-content: center;
    flex-direction: column;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 0.5rem;
}

.public-footer {
    padding: 1rem 0;
    font-size: 0.85rem;
    color: var(--clr-gray-300);
}

.public-footer a {
    color: var(--clr-gray-200);
}
</style>
