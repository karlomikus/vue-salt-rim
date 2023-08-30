<template>
    <div>
        <OverlayLoader v-if="isLoading" />
        <IngredientFinder @ingredient-selected="selectIngredient"></IngredientFinder>
        <div style="margin: 1rem 0;">
            <!-- <Checkbox v-model="isAddingSubstitute" id="substitute-adding">{{ $t('ingredient-dialog.select-substitutes') }}</Checkbox> -->
            <label class="form-checkbox">
                <input type="checkbox" v-model="isAddingSubstitute">
                <span>{{ $t('ingredient-dialog.select-substitutes') }}</span>
            </label>
        </div>
        <div class="selected-ingredient">
            <small>{{ $t('ingredient-dialog.current') }}:</small>
            <p>{{ cocktailIngredient.name }}</p>
        </div>
        <div class="selected-ingredient selected-ingredient--substitutes">
            <small>{{ $t('substitutes') }}:</small>
            <p>
                <template v-if="cocktailIngredient.substitutes.length > 0">
                    <span v-for="substitute in cocktailIngredient.substitutes" :key="substitute.id">{{ substitute.name }} &middot; <a href="#" @click.prevent="removeSubstitute(substitute)">{{ $t('remove') }}</a></span>
                </template>
                <span v-else>{{ $t('no-substitutes') }}</span>
            </p>
        </div>
        <div class="ingredient-form-group">
            <div class="form-group">
                <label class="form-label" for="ingredient-amount">{{ $t('amount') }}:</label>
                <input class="form-input" type="text" id="ingredient-amount" v-model="normalizedAmount">
            </div>
            <div class="form-group">
                <label class="form-label" for="ingredient-units">{{ $t('units') }}:</label>
                <input class="form-input" type="text" id="ingredient-units" list="common-units" v-model="cocktailIngredient.units">
                <p class="form-input-hint">{{ $t('units-help-text') }}</p>
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
        <div style="margin: 1rem 0;">
            <!-- <Checkbox v-model="cocktailIngredient.optional" id="is-cocktail-ing-optional">{{ $t('ingredient-dialog.optional-checkbox') }}</Checkbox> -->
            <label class="form-checkbox">
                <input type="checkbox" v-model="cocktailIngredient.optional">
                <span>{{ $t('ingredient-dialog.optional-checkbox') }}</span>
            </label>
        </div>
        <div class="dialog-actions">
            <button type="button" class="button button--outline" @click="cancel">{{ $t('cancel') }}</button>
            <button type="button" class="button button--dark" @click="save" :disabled="isLoading">{{ $t('save') }}</button>
        </div>
    </div>
</template>

<script>
import OverlayLoader from './../OverlayLoader.vue'
import IngredientFinder from './../IngredientFinder.vue'

export default {
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
            currentQuery: null,
            isAddingSubstitute: false
        }
    },
    components: {
        OverlayLoader,
        IngredientFinder,
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
        }
    },
    methods: {
        selectIngredient(item) {
            if (this.isAddingSubstitute) {
                if (this.cocktailIngredient.substitutes && this.cocktailIngredient.substitutes.some(sub => sub.id == item.id)) {
                    return;
                }

                this.cocktailIngredient.substitutes.push({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                })
            } else {
                this.cocktailIngredient.ingredient_id = item.id;
                this.cocktailIngredient.name = item.name;
                this.cocktailIngredient.ingredient_slug = item.slug;
            }
        },
        save() {
            this.isAddingSubstitute = false;
            this.$emit('close', {type: 'save'});
        },
        cancel() {
            // this.cocktailIngredient.ingredient_id = null
            this.isAddingSubstitute = false;
            this.$emit('close', {type: 'cancel'});
        },
        removeSubstitute(ing) {
            this.cocktailIngredient.substitutes.splice(
                this.cocktailIngredient.substitutes.findIndex(i => i == ing),
                1
            );
        }
    },
};
</script>

<style scoped>
.modal .ais-SearchBox-reset,
.modal .ais-SearchBox-submit {
    display: none;
}

.selected-ingredient {
    margin: 1rem 0;
    line-height: 1.3;
}

.selected-ingredient small {
    color: var(--clr-gray-400);
}

.selected-ingredient p {
    font-weight: bold;
    font-size: 1.5rem;
}

.selected-ingredient.selected-ingredient--substitutes {
    margin-bottom: 2rem;
}

.selected-ingredient.selected-ingredient--substitutes p {
    font-size: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.ingredient-modal__info {
    padding: 0.5rem;
    margin-top: 1rem;
}

@media (max-width: 450px) {
    .ingredient-modal {
        padding: 5px;
    }
}

.ingredient-form-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.ingredient-form-group .form-group:first-child {
    flex-basis: 150px;
}

.ingredient-form-group .form-group:last-child {
    flex-basis: 200px;
    flex-grow: 1;
}

.ingredient-form-group input {
    width: 100%;
}
</style>
