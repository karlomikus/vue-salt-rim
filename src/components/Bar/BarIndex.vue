<template>
    <PageHeader>
        {{ $t("bars.title") }}
        <template #actions>
            <SaltRimDialog v-model="showJoinDialog">
                <template #trigger>
                    <button type="button" class="button button--outline" @click.prevent="showJoinDialog = !showJoinDialog">{{ $t("bars.join") }}</button>
                </template>
                <template #dialog>
                    <BarJoinDialog @dialog-closed="showJoinDialog = false" @bar-joined="fetchBars" />
                </template>
            </SaltRimDialog>
            <RouterLink v-if="showCreateAction" class="button button--dark" :to="{ name: 'bars.form' }">{{ $t("bars.add") }}</RouterLink>
        </template>
    </PageHeader>
    <div class="bars">
        <OverlayLoader v-if="isLoading"></OverlayLoader>
        <SubscriptionCheck v-if="bars.length >= 1">Subscribe to "Mixologist" plan to create and manage up to 10 bars!</SubscriptionCheck>
        <div v-if="bars.length > 0" class="bars__groups">
            <template v-for="(barsInGroup, group) in groupedBars" :key="group">
                <h3 v-if="barsInGroup.length > 0" class="page-subtitle">{{ $t("bars.status." + group) }}</h3>
                <div class="bars__grid">
                    <div v-for="bar in barsInGroup" :key="bar.id" class="bar block-container block-container--hover" :class="{ 'bar--inactive': bar.status != 'active' }">
                        <span class="bar__role">
                            {{ getRoleName(bar.access.role_id) }}
                            <template v-if="bar.created_user?.id == appState.user.id">&middot; Owner</template>
                        </span>
                        <a href="#" @click.prevent="selectBar(bar)"
                            ><h4 class="bar__title">{{ bar.name }}</h4></a
                        >
                        <p class="bar__owner">
                            Bar ID: {{ bar.id }} &middot; {{ $t("created-by") }} {{ bar.created_user?.name }} &middot;
                            <DateFormatter :date="bar.created_at" />
                        </p>
                        <template v-if="bar.invite_code && bar.access.can_edit">
                            <div class="bar__invite_label_container">
                                <label class="form-label">{{ $t("bars.invite-code") }}:</label>
                                <a href="#" @click.prevent="copyInviteLinkToClipboard(bar.invite_code)">Copy invite link</a>
                            </div>
                            <p class="bar__invite_code">
                                {{ bar.invite_code }}
                            </p>
                        </template>
                        <p v-if="bar.is_public">
                            <RouterLink :to="{ name: 'public.cocktails.index', params: { barId: bar.slug } }" target="_blank">Public bar link</RouterLink>
                        </p>
                        <p class="bar__subtitle">{{ bar.subtitle }}</p>
                        <p class="bar__description">{{ bar.description }}</p>
                        <div class="bar__actions">
                            <template v-if="bar.access.can_delete">
                                <a href="#" @click.prevent="confirmDeleteBar(bar)">{{ $t("remove") }}</a>
                                &middot;
                            </template>
                            <template v-if="!bar.access.can_delete">
                                <a href="#" @click.prevent="confirmLeaveBar(bar)">{{ $t("leave") }}</a>
                                &middot;
                            </template>
                            <template v-if="bar.access.can_edit">
                                <RouterLink v-if="bar.access.can_edit" :to="{ name: 'bars.form', query: { id: bar.id } }">{{ $t("edit") }}</RouterLink>
                                &middot;
                            </template>
                            <a v-if="bar.status == 'active'" href="#" @click.prevent="selectBar(bar)">{{ $t("bars.select-bar") }}</a>
                            <a v-if="bar.status == 'deactivated' && bar.access.can_activate" href="#" @click.prevent="confirmActivateBar(bar)">{{ $t("bars.activate") }}</a>
                        </div>
                    </div>
                </div>
            </template>
        </div>
        <EmptyState v-else>
            <template #icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                    <path
                        d="M21 19H23V21H1V19H3V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V19H19V11H17V9H20C20.5523 9 21 9.44772 21 10V19ZM5 5V19H13V5H5ZM7 11H11V13H7V11ZM7 7H11V9H7V7Z"
                    ></path>
                </svg>
            </template>
            <template #default>
                {{ $t("bars.empty") }}
            </template>
        </EmptyState>
    </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useClipboard } from "@vueuse/core";
import { useTitle } from "@/composables/title";
import OverlayLoader from "@/components/OverlayLoader.vue";
import SaltRimDialog from "@/components/Dialog/SaltRimDialog.vue";
import PageHeader from "@/components/PageHeader.vue";
import BarJoinDialog from "@/components/Bar/BarJoinDialog.vue";
import DateFormatter from "@/components/DateFormatter.vue";
import { getRoleName } from "@/composables/useGetRoleName";
import EmptyState from "@/components/EmptyState.vue";
import SubscriptionCheck from "@/components/SubscriptionCheck.vue";
import { useSaltRimToast } from "@/composables/toast";
import { useConfirm } from "@/composables/confirm";
import { useBars, type Bar } from "@/composables/bar/useBars";
import { useAppState } from "@/composables/useAppState";

const route = useRoute();
const appState = useAppState();
const { t } = useI18n();
const toast = useSaltRimToast();
const confirm = useConfirm();
const { bars, isLoading, fetchBars, groupedBars, deleteBar, leaveBar, activateBar } = useBars();

const showJoinDialog = ref(route.name == "bars.join");

const ownedBars = computed(() => {
    return bars.value.filter((bar) => {
        return bar.created_user?.id == appState.user.id;
    });
});

const showCreateAction = computed(() => {
    if (appState.isSubscribed()) {
        return ownedBars.value.length < 10;
    }

    return ownedBars.value.length < 1 && !appState.isSubscribed();
});

useTitle(t("bars.title"));

onMounted(() => {
    fetchBars();
});

function copyInviteLinkToClipboard(invite_code: string | null) {
    const { copy, copied, isSupported } = useClipboard();

    if (!isSupported.value) {
        toast.error(t("permissions.clipboard-error"));
        return;
    }

    copy(`${window.location.origin}/bars/join/${invite_code ?? ""}`);

    if (copied.value) {
        toast.default(t("bars.invite-link-copied"));
    }
}

function selectBar(bar: Bar) {
    appState.setBar(bar);
    window.location.replace("/");
}

function confirmDeleteBar(bar: Bar) {
    confirm.show(t("bars.confirm-delete", { name: bar.name }), {
        onResolved: async (dialog: { close: () => void }) => {
            await deleteBar(bar.id);

            dialog.close();

            if (appState.bar.id == bar.id) {
                appState.forgetBar();
                window.location.reload();
            }
        },
    });
}

function confirmLeaveBar(bar: Bar) {
    confirm.show(t("bars.confirm-leave", { name: bar.name }), {
        onResolved: async (dialog: { close: () => void }) => {
            await leaveBar(bar.id);

            dialog.close();

            if (appState.bar.id == bar.id) {
                appState.forgetBar();
                window.location.reload();
            }
        },
    });
}

function confirmActivateBar(bar: Bar) {
    confirm.show(t("bars.confirm-activation", { name: bar.name }), {
        onResolved: async (dialog: { close: () => void }) => {
            await activateBar(bar.id);
            dialog.close();
            fetchBars();
        },
    });
}
</script>
<style scoped>
.bars__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-size-2);
}

.bars__groups {
    display: flex;
    flex-direction: column;
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
    color: var(--clr-gray-500);
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
    background-color: var(--clr-gray-950);
}
</style>
