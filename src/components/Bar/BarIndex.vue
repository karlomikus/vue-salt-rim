<template>
    <PageHeader>
        {{ $t('bars.title') }}
        <template #actions>
            <SaltRimDialog v-model="showJoinDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="showJoinDialog = !showJoinDialog">{{ $t('bars.join') }}</button>
                </template>
                <template #dialog>
                    <BarJoinDialog @dialog-closed="showJoinDialog = false" @bar-joined="refreshBars" />
                </template>
            </SaltRimDialog>
            <RouterLink v-if="showCreateAction" class="button button--dark" :to="{ name: 'bars.form' }">{{ $t('bars.add') }}</RouterLink>
        </template>
    </PageHeader>
    <div class="bars">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <SubscriptionCheck v-if="bars.length >= 1">Subscribe to "Mixologist" plan to create and manage up to 10 bars!</SubscriptionCheck>
        <div v-if="bars.length > 0">
            <template v-for="(barsInGroup, group) in groupedBars" :key="group">
                <h3 v-if="barsInGroup.length > 0" class="page-subtitle">{{ $t('bars.status-' + group) }}</h3>
                <div class="bars__grid">
                    <div v-for="bar in barsInGroup" :key="bar.id" class="bar block-container block-container--hover" :class="{ 'bar--inactive': bar.status != 'active' }">
                        <span class="bar__role">
                            {{ getRoleName(bar.access.role_id) }}
                            <template v-if="bar.created_user.id == appState.user.id">&middot; Owner</template>
                        </span>
                        <h4 class="bar__title">{{ bar.name }}</h4>
                        <p class="bar__owner">{{ $t('created-by') }} {{ bar.created_user.name }} &middot;
                            <DateFormatter :date="bar.created_at" />
                        </p>
                        <template v-if="bar.show_invite_code && bar.access.can_edit">
                            <div class="bar__invite_label_container">
                                <label class="form-label">{{ $t('bars.invite-code') }}:</label>
                                <a href="#" @click.prevent="copyInviteLinkToClipboard(bar.invite_code)">Copy invite link</a>
                            </div>
                            <p class="bar__invite_code">
                                {{ bar.invite_code }}
                            </p>
                        </template>
                        <p class="bar__subtitle">{{ bar.subtitle }}</p>
                        <p class="bar__description">{{ bar.description }}</p>
                        <div class="bar__actions">
                            <template v-if="bar.access.can_delete">
                                <a href="#" @click.prevent="deleteBar(bar)">{{ $t('remove') }}</a>
                                &middot;
                            </template>
                            <template v-if="!bar.access.can_delete">
                                <a href="#" @click.prevent="leaveBar(bar)">{{ $t('leave') }}</a>
                                &middot;
                            </template>
                            <template v-if="bar.access.can_edit">
                                <RouterLink v-if="bar.access.can_edit" :to="{ name: 'bars.form', query: { id: bar.id } }">{{ $t('edit') }}</RouterLink>
                                &middot;
                            </template>
                            <template v-if="bar.invite_code && bar.access.can_edit">
                                <a href="#" @click.prevent="bar.show_invite_code = !bar.show_invite_code">{{ $t('bars.toggle-invite-code') }}</a>
                                &middot;
                            </template>
                            <a v-if="bar.status == 'active'" href="#" @click.prevent="selectBar(bar)">{{ $t('bars.select-bar') }}</a>
                            <a v-if="bar.status == 'deactivated' && bar.access.can_activate" href="#" @click.prevent="activateBar(bar)">{{ $t('bars.activate') }}</a>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <EmptyState v-else>
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                    <path d="M21 19H23V21H1V19H3V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V19H19V11H17V9H20C20.5523 9 21 9.44772 21 10V19ZM5 5V19H13V5H5ZM7 11H11V13H7V11ZM7 7H11V9H7V7Z"></path>
                </svg>
            </template>
            <template #default>
                {{ $t('bars.empty') }}
            </template>
        </EmptyState>
    </div>
</template>
<script>
import { useTitle } from '@/composables/title'
import OverlayLoader from './../OverlayLoader.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import PageHeader from './../PageHeader.vue'
import BarJoinDialog from './BarJoinDialog.vue'
import AppState from './../../AppState.js'
import DateFormatter from './../DateFormatter.vue'
import Utils from './../../Utils.js'
import EmptyState from './../EmptyState.vue'
import SubscriptionCheck from '../SubscriptionCheck.vue'
import BarAssistantClient from '@/api/BarAssistantClient'

export default {
    components: {
        OverlayLoader,
        PageHeader,
        SaltRimDialog,
        BarJoinDialog,
        DateFormatter,
        EmptyState,
        SubscriptionCheck,
    },
    data() {
        return {
            isLoading: false,
            bars: [],
            showJoinDialog: (this.$route.name == 'bars.join'), // If the route is bars.join then show the join dialog, otherwise don't
            showCreateDialog: false,
            appState: new AppState(),
        }
    },
    computed: {
        groupedBars() {
            const res = {
                'active': [],
                'provisioning': [],
                'deactivated': [],
            }

            this.bars.forEach(bar => {
                res[bar.status].push(bar)
            })

            return res
        },
        ownedBars() {
            return this.bars.filter(bar => {
                return bar.created_user.id == this.appState.user.id
            })
        },
        showCreateAction() {
            if (this.appState.isSubscribed()) {
                return this.ownedBars.length < 10
            }

            return this.ownedBars.length < 1 && !this.appState.isSubscribed()
        }
    },
    created() {
        useTitle(this.$t('bars.title'))
    },
    mounted() {
        this.refreshBars()
    },
    methods: {
        copyInviteLinkToClipboard(invite_code) {
            if (Utils.copyToClipboard(`${window.location.origin}/bars/join/${invite_code}`)) {
                this.$toast.success(this.$t('bars.invite-link-copied'))
            } else {
                this.$toast.error(this.$t('bars.invite-link-error'))
            }
        },
        refreshBars() {
            this.isLoading = true
            BarAssistantClient.getBars().then(resp => {
                this.bars = resp.data.map(bar => {
                    bar.show_invite_code = false

                    return bar
                })
                this.isLoading = false
            }).catch(e => {
                this.$toast.error(e.message)
                this.isLoading = false
            })
        },
        selectBar(bar) {
            this.appState.setBar(bar)
            window.location.replace('/')
        },
        getRoleName(roleId) {
            return Utils.getRoleName(roleId)
        },
        deleteBar(bar) {
            this.$confirm(this.$t('bars.confirm-delete', { name: bar.name }), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    BarAssistantClient.deleteBar(bar.id).then(() => {
                        this.isLoading = false
                        if (this.appState.bar.id == bar.id) {
                            this.appState.forgetBar()
                            window.location.reload()
                        }
                        this.$toast.default(this.$t('bars.delete-success'))
                        this.refreshBars()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
        leaveBar(bar) {
            this.$confirm(this.$t('bars.confirm-leave', { name: bar.name }), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    BarAssistantClient.leaveBar(bar.id).then(() => {
                        this.isLoading = false
                        if (this.appState.bar.id == bar.id) {
                            this.appState.forgetBar()
                            window.location.reload()
                        }
                        this.$toast.default(this.$t('bars.delete-success'))
                        this.refreshBars()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
        activateBar(bar) {
            this.$confirm(this.$t('bars.confirm-activation', { name: bar.name }), {
                onResolved: (dialog) => {
                    this.isLoading = true
                    dialog.close()
                    BarAssistantClient.updateBarStatus(bar.id, 'active').then(() => {
                        this.isLoading = false
                        this.$toast.default(this.$t('bars.activation-success'))
                        this.refreshBars()
                    }).catch(e => {
                        this.$toast.error(e.message)
                        this.isLoading = false
                    })
                }
            })
        },
    }
}
</script>
<style scoped>
.bars__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-size-2);
}

@media (max-width: 450px) {
    .bars__grid {
        grid-template-columns: 1fr;
    }
}

.bar {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.bar--inactive {
    background: none;
}

.bar__role {
    background-color: var(--clr-gray-100);
    padding: 1px 3px;
    border-radius: var(--radius-1);
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
}

.dark-theme .bar__role {
    background-color: var(--clr-accent-700);
}

.bar__title {
    font-size: 1.65rem;
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    line-height: 1.1;
}

.bar__owner {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    color: var(--clr-gray-400);
}

.bar__invite_label_container {
    display: flex;
    justify-content: space-between;
}

.bar__invite_code {
    background: var(--clr-gray-100);
    padding: 0.25rem;
    font-family: var(--font-mono);
    letter-spacing: 1px;
}

.dark-theme .bar__invite_code {
    background-color: var(--clr-dark-main-950);
}
</style>
