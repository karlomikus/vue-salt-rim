<template>
    <div class="public-page">
        <div class="public-page__header">
            <Logo></Logo>
        </div>
        <PublicRecipe :cocktail="cocktail"></PublicRecipe>
        <div class="public-footer">
            Powered by <a href="https://github.com/karlomikus/bar-assistant">Bar Assistant</a>
        </div>
    </div>
</template>

<script>
import ApiRequests from '@/ApiRequests';
import Logo from '@/components/Logo.vue'
import PublicRecipe from '@/components/Cocktail/PublicRecipe.vue'

export default {
    components: {
        Logo,
        PublicRecipe
    },
    data() {
        return {
            isLoading: false,
            cocktail: {},
        }
    },
    watch: {
        cocktail(val) {
            document.title = `${val.name} \u22C5 ${this.site_title}`
        }
    },
    created() {
        document.title = `Cocktail \u22C5 ${this.site_title}`
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
                this.$toast.error(e.message);
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
