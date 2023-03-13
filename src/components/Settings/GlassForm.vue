<template>
    <form @submit.prevent="submit">
        <OverlayLoader v-if="isLoading" />
        <div class="dialog-title">{{ dialogTitle }}</div>
        <div class="form-group">
            <label class="form-label form-label--required" for="name">Name:</label>
            <input class="form-input" type="text" id="name" v-model="glass.name" required placeholder="Glass name...">
        </div>
        <div class="form-group">
            <label class="form-label" for="description">Description:</label>
            <textarea rows="5" class="form-input" id="description" v-model="glass.description" placeholder="Glass description..."></textarea>
        </div>
        <div class="dialog-actions">
            <button class="button button--outline" @click.prevent="$emit('glassDialogClosed')">Cancel</button>
            <button class="button button--dark" type="submit">Save</button>
        </div>
    </form>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'

export default {
    props: ['sourceGlass', 'dialogTitle'],
    data() {
        return {
            isLoading: false,
            glass: this.sourceGlass,
        };
    },
    components: {
        OverlayLoader,
    },
    methods: {
        submit() {
            this.isLoading = true;

            const postData = {
                name: this.glass.name,
                description: this.glass.description,
            };

            if (this.glass.id) {
                ApiRequests.updateGlass(this.glass.id, postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Glass updated successfully.`);
                    this.$emit('glassDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            } else {
                ApiRequests.saveGlass(postData).then(() => {
                    this.isLoading = false;
                    this.$toast.default(`Glass added successfully.`);
                    this.$emit('glassDialogClosed')
                }).catch(e => {
                    this.$toast.error(e.message);
                    this.isLoading = false;
                })
            }
        }
    }
}
</script>
