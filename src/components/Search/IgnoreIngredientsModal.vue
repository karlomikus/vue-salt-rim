<template>
    <form @submit.prevent="filter">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('search.select-ingredients-to-ignore') }}</div>
        <IngredientFinder @ingredient-selected="selectIngredient"></IngredientFinder>
        <div class="ignore-modal-selected-ingredients">
            <div v-for="ing in selectedIngredients" :key="ing.id" class="ignore-modal-selected-ingredients__ingredient">
                {{ ing.name }} <button type="button" @click.prevent="removeIngredient(ing)"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12" fill="currentcolor"><path fill="none" d="M0 0h24v24H0z" /><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" /></svg></button>
            </div>
        </div>
        <div class="dialog-actions">
            <button type="submit" class="button button--dark" :disabled="isLoading">{{ $t('filter') }}</button>
        </div>
    </form>
</template>

<script>
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'
import ApiRequests from '../../ApiRequests'

export default {
    components: {
        OverlayLoader,
        IngredientFinder,
    },
    props: {
        value: {
            type: Array,
            default() {
                return []
            }
        }
    },
    emits: ['close'],
    data() {
        return {
            isLoading: false,
            selectedIngredients: [],
        }
    },
    created() {
        this.matchIngredients()
    },
    methods: {
        matchIngredients() {
            if (this.value.length > 0) {
                this.isLoading = true
                ApiRequests.fetchIngredients({'filter[id]': this.value.join(',')}).then(data => {
                    this.selectedIngredients = data.data
                    this.isLoading = false
                }).catch(() => {
                    this.isLoading = false
                })
            }
        },
        selectIngredient(item) {
            if (this.selectedIngredients.some(sub => sub.id == item.id)) {
                return
            }

            this.selectedIngredients.push(item)
        },
        removeIngredient(item) {
            this.selectedIngredients.splice(
                this.selectedIngredients.findIndex(i => i == item),
                1
            )
        },
        filter() {
            this.$emit('close', {newFilters: this.selectedIngredients.map(i => i.id)})
        }
    },
}
</script>

<style scoped>
.ignore-modal-selected-ingredients {
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
    margin-top: var(--gap-size-3);
}

.ignore-modal-selected-ingredients__ingredient {
    background-color: var(--clr-gray-800);
    color: var(--clr-gray-100);
    padding: 3px 8px;
    border-radius: 3px;
    display: flex;
    gap: var(--gap-size-1);
    align-items: center;
}

.ignore-modal-selected-ingredients__ingredient button {
    color: var(--clr-gray-100);
    padding: 0;
    margin: 0;
    border: 0;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    cursor: pointer;
    background-color: var(--clr-gray-500);
    display: flex;
    align-items: center;
    justify-content: center;
}

.ignore-modal-selected-ingredients__ingredient button:hover {
    background-color: rgb(168, 20, 9);
}
</style>
