<template>
    <PageHeader>
        {{ $t('bars.title') }}
        <template #actions>
            <SaltRimDialog v-model="showJoinDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="showJoinDialog = !showJoinDialog">{{ $t('bars.join') }}</button>
                </template>
                <template #dialog>
                    <BarJoinDialog @dialog-closed="showJoinDialog = false" />
                </template>
            </SaltRimDialog>
            <SaltRimDialog v-model="showCreateDialog">
                <template #trigger>
                    <button type="button" class="button button--dark" @click.prevent="showCreateDialog = !showCreateDialog">{{ $t('bars.add') }}</button>
                </template>
                <template #dialog>
                    <BarForm @bar-created="refreshBars" @dialog-closed="showCreateDialog = false" />
                </template>
            </SaltRimDialog>
        </template>
    </PageHeader>
    <div class="bars">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <div v-if="bars.length > 0" class="bars__grid">
            <div v-for="bar in bars" :key="bar.id" class="bar block-container">
                <h4 class="bar__title">{{ bar.name }}</h4>
                <small class="bar__subtitle">{{ bar.subtitle }}</small>
                <p class="bar__description">{{ bar.description }}</p>
                <p class="bar__invite_code">{{ bar.invite_code }}</p>
                <div class="bar__actions">
                    <a href="#" @click.prevent="deleteBar(bar)">{{ $t('remove') }}</a>
                    &middot;
                    <a href="#">Edit</a>
                    &middot;
                    <a href="#" @click.prevent="selectBar(bar)">Select bar</a>
                </div>
            </div>
        </div>
        <div v-else class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M21 19H23V21H1V19H3V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V19H19V11H17V9H20C20.5523 9 21 9.44772 21 10V19ZM5 5V19H13V5H5ZM7 11H11V13H7V11ZM7 7H11V9H7V7Z"></path></svg>
            <p>{{ $t('bars.empty') }}</p>
        </div>
    </div>
</template>
<script>
import ApiRequests from './../../ApiRequests';
import OverlayLoader from './../OverlayLoader.vue';
import SaltRimDialog from './../Dialog/SaltRimDialog.vue';
import PageHeader from './../PageHeader.vue';
import BarForm from './BarForm.vue';
import BarJoinDialog from './BarJoinDialog.vue';
import AppState from './../../AppState.js';

export default {
    components: {
        OverlayLoader,
        PageHeader,
        BarForm,
        SaltRimDialog,
        BarJoinDialog
    },
    data() {
        return {
            isLoading: false,
            bars: [],
            showJoinDialog: false,
            showCreateDialog: false,
        }
    },
    mounted() {
        this.refreshBars();
    },
    methods: {
        refreshBars() {
            this.isLoading = true
            ApiRequests.fetchBars().then(data => {
                this.bars = data;
                this.isLoading = false
            })
        },
        selectBar(bar) {
            const appState = new AppState();
            appState.setBar(bar)
            window.location.replace('/')
        },
        deleteBar(bar) {
            this.$confirm(this.$t('bars.confirm-delete', {name: bar.name}), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close();
                    ApiRequests.deleteBar(bar.id).then(() => {
                        this.isLoading = false;
                        const appState = new AppState();
                        if (appState.bar.id == bar.id) {
                            appState.forgetBar();
                            window.location.reload()
                        }
                        this.$toast.default(this.$t('bars.delete-success'));
                        this.refreshBars()
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
<style scoped>
.bars__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 0.5rem;
}

.bar {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.bar__title {
    font-size: 1.5rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    line-height: 1.3;
}

.bar__invite_code {
    background: var(--clr-gray-100);
    padding: 0.25rem;
    font-family: monospace;
    letter-spacing: 1px;
}
</style>
