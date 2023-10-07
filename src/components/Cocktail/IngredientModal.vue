<template>
    <form @submit.prevent="save">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('ingredient.title') }}</div>
        <IngredientFinder @ingredient-selected="selectIngredient"></IngredientFinder>
        <div class="selected-ingredient">
            <small>{{ $t('ingredient.dialog.current') }}:</small>
            <p>{{ cocktailIngredient.name }}</p>
        </div>
        <label class="form-checkbox">
            <input v-model="cocktailIngredient.optional" type="checkbox">
            <span>{{ $t('ingredient.dialog.optional-checkbox') }}</span>
        </label>
        <label class="form-checkbox">
            <input v-model="hasVariableAmount" type="checkbox">
            <span>{{ $t('ingredient.has-variable-amount') }}</span>
        </label>
        <div class="ingredient-form-group">
            <div class="form-group">
                <label class="form-label form-label--required" for="ingredient-amount">{{ $t('amount') }}:</label>
                <input id="ingredient-amount" v-model="normalizedAmount" class="form-input" type="text" required>
            </div>
            <div v-if="hasVariableAmount" class="form-group">
                <label class="form-label" for="ingredient-amount-max">{{ $t('amount') }} max:</label>
                <input id="ingredient-amount-max" v-model="normalizedMaxAmount" class="form-input" type="text">
            </div>
            <div class="form-group">
                <label class="form-label form-label--required" for="ingredient-units">{{ $t('units') }}:</label>
                <input id="ingredient-units" v-model="cocktailIngredient.units" class="form-input" type="text" list="common-units" required>
                <datalist id="common-units">
                    <option>ml</option>
                    <option>oz</option>
                    <option>cl</option>
                    <option>dashes</option>
                    <option>barspoon</option>
                    <option>drops</option>
                </datalist>
            </div>
        </div>
        <!-- <p class="form-input-hint">{{ $t('units-help-text') }}</p> -->
        <div class="form-group">
            <label class="form-label" for="ingredient-note">{{ $t('note.title') }}:</label>
            <input id="ingredient-note" v-model="cocktailIngredient.note" class="form-input" type="text">
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="cancel">{{ $t('cancel') }}</button>
            <button type="submit" class="button button--dark" :disabled="isLoading">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'

export default {
    components: {
        OverlayLoader,
        IngredientFinder,
    },
    props: {
        value: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    emits: ['close'],
    data() {
        return {
            isLoading: false,
            cocktailIngredient: this.value,
            hasVariableAmount: this.value.amount_max != null,
        }
    },
    computed: {
        normalizedAmount: {
            get() {
                return this.cocktailIngredient.amount
            },
            set(newValue) {
                if (newValue.startsWith('.')) {
                    this.cocktailIngredient.amount = '0' + newValue
                } else {
                    this.cocktailIngredient.amount = newValue
                }
            }
        },
        normalizedMaxAmount: {
            get() {
                return this.cocktailIngredient.amount_max
            },
            set(newValue) {
                if (!newValue) {
                    this.cocktailIngredient.amount_max = null
                    return
                }

                if (newValue.startsWith('.')) {
                    this.cocktailIngredient.amount_max = '0' + newValue
                } else {
                    this.cocktailIngredient.amount_max = newValue
                }
            }
        }
    },
    watch: {
        hasVariableAmount(newVal) {
            if (newVal == false) {
                this.normalizedMaxAmount = null
            }
        }
    },
    methods: {
        selectIngredient(item) {
            this.cocktailIngredient.ingredient_id = item.id
            this.cocktailIngredient.name = item.name
            this.cocktailIngredient.ingredient_slug = item.slug
        },
        save() {
            this.$emit('close', {type: 'save'})
        },
        cancel() {
            this.$emit('close', {type: 'cancel'})
        }
    },
}
</script>

<style scoped>
.selected-ingredient {
    margin: 1rem 0;
    line-height: 1.3;
}

.selected-ingredient small {
    color: var(--clr-gray-500);
}

.selected-ingredient p {
    font-weight: bold;
    font-size: 1.5rem;
}

.ingredient-form-group {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-1);
}

.ingredient-form-group .form-group {
    flex-basis: 150px;
}

.ingredient-form-group .form-group:last-child {
    flex-basis: 100px;
    flex-grow: 1;
}

.ingredient-form-group input {
    width: 100%;
}
</style>
