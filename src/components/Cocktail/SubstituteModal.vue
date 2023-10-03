<template>
    <form @submit.prevent="save">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ $t('ingredient-dialog.select-substitutes') }}</div>
        <p style="margin-bottom: 1rem;">Select substitute ingredients for "{{ cocktailIngredient.name }}".</p>
        <IngredientFinder @ingredient-selected="selectIngredient"></IngredientFinder>
        <div class="substitutes">
            <h4>{{ $t('substitutes') }}:</h4>
            <div v-for="(substitute, index) in selectedSubstitutes" :key="substitute.id" class="substitutes__substitute">
                <div class="substitutes__substitute__name">
                    <h5>{{ substitute.name }}</h5>
                    <div class="substitutes__substitute__actions">
                        <a href="#" @click.prevent="toggleAmountDisplay(substitute)">Edit amounts</a>
                        &middot;
                        <a href="#" @click.prevent="removeIngredient(substitute)">Remove</a>
                    </div>
                </div>
                <div v-show="amountDisplayTracker.includes(substitute.id)" class="substitutes__substitute__input">
                    <div class="form-group">
                        <label class="form-label" :for="'sub-ingredient-amount-' + substitute.id">{{ $t('amount') }}:</label>
                        <input :id="'sub-ingredient-amount-' + substitute.id" v-model="substitute.amount" class="form-input" type="text">
                    </div>
                    <div class="form-group">
                        <label class="form-label" :for="'sub-ingredient-amount-max-' + substitute.id">{{ $t('amount') }} max:</label>
                        <input :id="'sub-ingredient-amount-max-' + substitute.id" v-model="substitute.amount_max" class="form-input" type="text">
                    </div>
                    <div class="form-group">
                        <label class="form-label" :for="'sub-ingredient-units-' + substitute.id">{{ $t('units') }}:</label>
                        <input :id="'sub-ingredient-units-' + substitute.id" v-model="substitute.units" class="form-input" type="text" list="common-units">
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
                <div v-if="index != selectedSubstitutes.length - 1" class="substitutes__substitute__separator">or</div>
            </div>
            <div v-if="selectedSubstitutes.length == 0">
                {{ $t('no-substitutes') }}
            </div>
        </div>
        <div class="dialog-actions">
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
            selectedSubstitutes: this.value.substitutes,
            amountDisplayTracker: []
        }
    },
    methods: {
        selectIngredient(item) {
            if (this.selectedSubstitutes.some(sub => sub.id == item.id) || this.cocktailIngredient.ingredient_id == item.id) {
                return
            }

            this.selectedSubstitutes.push({
                name: item.name,
                id: item.id,
                slug: item.slug,
                amount: null,
                amount_max: null,
                units: null,
            })
        },
        removeIngredient(item) {
            this.selectedSubstitutes.splice(
                this.selectedSubstitutes.findIndex(i => i == item),
                1
            )
        },
        toggleAmountDisplay(sub) {
            if (this.amountDisplayTracker.includes(sub.id)) {
                this.amountDisplayTracker.splice(
                    this.amountDisplayTracker.findIndex(i => i == sub.id),
                    1
                )
            } else {
                this.amountDisplayTracker.push(sub.id)
            }
        },
        save() {
            // this.cocktailIngredient.substitutes = this.selectedSubstitutes
            this.$emit('close', {type: 'save'})
        }
    },
}
</script>

<style scoped>
.substitutes {
    display: flex;
    flex-direction: column;
    margin-top: 1rem;
}

.substitutes > h4 {
    font-weight: bold;
}

.substitutes__substitute__name {
    display: flex;
    align-items: baseline;
}

.substitutes__substitute__name h5 {
    font-size: 1.25rem;
}

.substitutes__substitute__name .substitutes__substitute__actions {
    margin-left: auto;
}

.substitutes__substitute__input {
    display: flex;
    gap: var(--gap-size-1);
}

.substitutes__substitute__input input {
    width: 100%;
}

.substitutes__substitute__input .form-group {
    flex-basis: 150px;
}

.substitutes__substitute__input .form-group:last-child {
    flex-basis: 100px;
    flex-grow: 1;
}

.substitutes__substitute__separator {
    text-align: center;
    text-transform: uppercase;
    font-size: 0.75rem;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 5px;
    background: var(--clr-gray-100);
    color: var(--clr-gray-400);
    padding: 2px 0;
}
</style>
