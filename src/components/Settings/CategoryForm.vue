<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">{{ $t('name') }}:</label>
            <input id="name" v-model="category.name" class="form-input" type="text" required>
        </div>
        <div class="form-group">
            <label class="form-label" for="description">{{ $t('description') }}:</label>
            <textarea id="description" v-model="category.description" rows="5" class="form-input"></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('categoryDialogClosed')">{{ $t('cancel') }}</button>
            <button class="button button--dark" type="submit">{{ $t('save') }}</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from '@/ApiRequests'
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    components: {
        OverlayLoader
    },
    props: {
        sourceCategory: {
            type: Object,
            default() {
                return {}
            }
        },
        dialogTitle: {
            type: String,
            default: ''
        },
    },
    emits: ['categoryDialogClosed'],
    data() {
        return {
            isLoading: false,
            categoryId: null,
            category: this.sourceCategory,
        }
    },
    methods: {
        submit() {
            this.isLoading = true

            const postData = {
                name: this.category.name,
                description: this.category.description,
            }

            if (this.category.id) {
                ApiRequests.updateIngredientCategory(this.category.id, postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('category.update-success'))
                    this.$emit('categoryDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            } else {
                ApiRequests.saveIngredientCategory(postData).then(() => {
                    this.isLoading = false
                    this.$toast.default(this.$t('category.add-success'))
                    this.$emit('categoryDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message)
                    this.isLoading = false
                })
            }
        }
    }
}
</script>
