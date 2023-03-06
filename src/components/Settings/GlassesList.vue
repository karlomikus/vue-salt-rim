<template>
    <PageHeader>
        Glass types
        <template #actions>
            <RouterLink class="button button--outline" :to="{name: 'settings.glasses.form'}">Add glass type</RouterLink>
        </template>
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content">
            <OverlayLoader v-if="isLoading" />
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
                            <RouterLink :to="{name: 'settings.glasses.form', query: {id: glass.id}}">{{ glass.name }}</RouterLink>
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
</template>

<script>
import ApiRequests from "@/ApiRequests";
import OverlayLoader from '@/components/OverlayLoader.vue'
import PageHeader from '@/components/PageHeader.vue'
import Navigation from '@/components/Settings/Navigation.vue'

export default {
    components: {
        OverlayLoader,
        Navigation,
        PageHeader
    },
    data() {
        return {
            isLoading: false,
            glasses: [],
        }
    },
    created() {
        document.title = `Glass types \u22C5 Salt Rim`

        this.refreshGlasses()
    },
    methods: {
        refreshGlasses() {
            this.isLoading = true;
            ApiRequests.fetchGlasses().then(data => {
                this.glasses = data;
                this.isLoading = false;
            }).catch(e => {
                this.$toast.error(e.message);
            })
        },
        deleteGlass(glass) {
            this.$confirm(`This will permanently delete glass type with name "${glass.name}".`, {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    ApiRequests.deleteGlass(glass.id).then(() => {
                        this.isLoading = false;
                        this.$toast.default(`Glass deleted successfully.`);
                        this.$router.push({ name: 'settings.glasses' })
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
