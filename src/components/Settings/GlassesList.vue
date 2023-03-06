<template>
    <PageHeader>
        Glass types
        <template #actions>
            <Dialog v-model="showDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="openDialog('Add glass type', {})">Add glass type</button>
                </template>
                <template #dialog>
                    <GlassForm :source-glass="editGlass" :dialog-title="dialogTitle" @glass-dialog-closed="refreshGlasses" />
                </template>
            </Dialog>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
            <div class="block-container block-container--padded">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Name / Description</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="glass in glasses">
                            <td>
                                <a href="#" @click.prevent="openDialog('Edit glass type', glass)">{{ glass.name }}</a>
                                <br>
                                <small>{{ glass.description }}</small>
                            </td>
                            <td style="text-align: right;">
                                <a class="list-group__action" href="#" @click.prevent="deleteGlass(glass)">Delete</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/Navigation.vue'
import Dialog from '@/components/Dialog/Dialog.vue'
import GlassForm from '@/components/Settings/GlassForm.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader,
        GlassForm,
        Dialog
    },
    data() {
        return {
            isLoading: false,
            showDialog: false,
            dialogTitle: 'Glass data',
            editGlass: {},
            glasses: [],
        }
    },
    created() {
        document.title = `Glass types \u22C5 Salt Rim`

        this.refreshGlasses()
    },
    methods: {
        refreshGlasses() {
            this.showDialog = false;
            this.isLoading = true;
            ApiRequests.fetchGlasses().then(data => {
                this.glasses = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        openDialog(title, obj) {
            this.dialogTitle = title
            this.editGlass = obj
            this.showDialog = true;
        },
        deleteGlass(glass) {
            this.$confirm(`This will permanently delete glass type with name "${glass.name}".`, {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.deleteGlass(glass.id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(`Glass deleted successfully.`);
                        this.refreshGlasses()
                    }).catch(e => {
                        this.$toast.error(e.message);
                        this.isLoading = false;
                    })
                }
            });
        }
    }
}
</script>
