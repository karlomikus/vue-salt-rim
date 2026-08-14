<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import BarAssistantClient from "@/api/BarAssistantClient";
import { useGitHubReleases } from "@/composables/useGitHubReleases";
import { useTitle } from "@/composables/title";
import type { components } from "@/api/api";
import PageHeader from "@/components/PageHeader.vue";
import Navigation from "@/components/Settings/SettingsNavigation.vue";

type ServerVersion = components["schemas"]["ServerVersion"];

const { t } = useI18n();

useTitle(t("about.title"));

const currentVersion = ref<string>(window.srConfig.VERSION ?? "");
const isDev = computed<boolean>(() => {
    return !currentVersion.value || currentVersion.value === "dev";
});

// Frontend client release (vue-salt-rim)
const {
    release: frontendRelease,
    isLoading: frontendLoading,
    error: frontendError,
    changelogHtml: frontendChangelogHtml,
    fetch: fetchFrontendRelease,
} = useGitHubReleases("karlomikus/vue-salt-rim");

// Backend API release notes (bar-assistant)
const {
    release: backendRelease,
    isLoading: backendReleaseLoading,
    error: backendReleaseError,
    changelogHtml: backendChangelogHtml,
    fetch: fetchBackendRelease,
} = useGitHubReleases("karlomikus/bar-assistant");

// Connected backend version (from the API)
const backendVersion = ref<ServerVersion | null>(null);
const backendVersionError = ref<string>("");

const isChecking = ref<boolean>(false);

function parseSemver(version: string): number[] | null {
    const cleaned = version.replace(/^v/, "");
    const parts = cleaned.split(".");
    if (parts.length < 2) return null;
    const nums = parts.map(Number);
    if (nums.some(isNaN)) return null;
    return nums;
}

const frontendUpdateStatus = computed<"newer" | "current" | "dev" | "error" | "checking">(() => {
    if (isChecking.value) return "checking";
    if (frontendError.value && !frontendRelease.value) return "error";
    if (isDev.value) return "dev";
    if (!frontendRelease.value) return "error";

    const running = parseSemver(currentVersion.value);
    const latest = parseSemver(frontendRelease.value.tag_name);

    if (!running || !latest) return "dev";

    for (let i = 0; i < Math.max(running.length, latest.length); i++) {
        const r = running[i] ?? 0;
        const l = latest[i] ?? 0;
        if (l > r) return "newer";
        if (r > l) return "current";
    }
    return "current";
});

interface TileData {
    currentVersion: string;
    latestVersion: string;
    isUpToDate: boolean;
    isLoading: boolean;
    error: boolean;
}

const backendUpdateStatus = computed<"up-to-date" | "update-available" | "unknown" | "error" | "checking">(() => {
    if (isChecking.value && !backendVersion.value && !backendVersionError.value) return "checking";
    if (backendVersionError.value && !backendVersion.value) return "error";
    if (!backendVersion.value) return "unknown";
    if (backendVersion.value.is_latest) return "up-to-date";
    if (backendVersion.value.latest_version) return "update-available";
    return "unknown";
});

const clientTileData = computed<TileData>(() => {
    const latestTag = frontendRelease.value?.tag_name ?? "";

    return {
        currentVersion: isDev.value ? t("about.dev-version") : currentVersion.value,
        latestVersion: latestTag || t("about.backend-version-unknown"),
        isUpToDate: frontendUpdateStatus.value === "current",
        isLoading: isChecking.value,
        error: frontendUpdateStatus.value === "error" && !frontendRelease.value,
    };
});

const apiTileData = computed<TileData>(() => {
    const bv = backendVersion.value;

    return {
        currentVersion: bv?.version ?? t("about.backend-version-unknown"),
        latestVersion: bv?.latest_version ?? bv?.version ?? t("about.backend-version-unknown"),
        isUpToDate: backendUpdateStatus.value === "up-to-date",
        isLoading: isChecking.value && !backendVersion.value && !backendVersionError.value,
        error: backendUpdateStatus.value === "error" || backendUpdateStatus.value === "unknown",
    };
});

async function fetchBackendVersion(): Promise<void> {
    backendVersionError.value = "";
    try {
        const response = await BarAssistantClient.getServerVersion();
        backendVersion.value = response?.data ?? null;
    } catch {
        backendVersion.value = null;
        backendVersionError.value = "fetch-error";
    }
}

async function checkForUpdates(): Promise<void> {
    isChecking.value = true;
    try {
        await Promise.allSettled([fetchFrontendRelease(), fetchBackendVersion(), fetchBackendRelease()]);
    } finally {
        isChecking.value = false;
    }
}

onMounted(() => {
    checkForUpdates();
});
</script>

<template>
    <PageHeader>
        {{ t("about.title") }}
    </PageHeader>
    <div class="settings-page">
        <div class="settings-page__nav">
            <Navigation />
        </div>
        <div class="settings-page__content about-info">
            <section class="about-info__version">
                <div class="about-info__versions">
                    <div class="block-container about-info__versions__tile">
                        <h3>{{ t("about.client") }}</h3>
                        <div v-if="clientTileData.isLoading" class="about-info__tile-checking">
                            {{ t("loading") }}
                        </div>
                        <div v-else class="about-info__tile-body">
                            <div class="about-info__tile-row">
                                <span class="about-info__tile-label">{{ t("about.current") }}</span>
                                <span
                                    class="about-info__tile-value"
                                    :class="{
                                        'about-info__tile-value--muted': clientTileData.currentVersion === '...',
                                    }"
                                    >{{ clientTileData.currentVersion }}</span
                                >
                            </div>
                            <div class="about-info__tile-row">
                                <span class="about-info__tile-label">{{ t("about.latest") }}</span>
                                <span
                                    class="about-info__tile-value"
                                    :class="{
                                        'about-info__tile-value--muted': clientTileData.latestVersion === t('about.backend-version-unknown'),
                                    }"
                                    >{{ clientTileData.latestVersion }}</span
                                >
                            </div>
                            <div v-if="clientTileData.isUpToDate" class="about-info__tile-check">
                                <span class="about-info__tile-checkmark">&#10003;</span>
                                {{ t("about.up-to-date") }}
                            </div>
                            <div v-else-if="clientTileData.error" class="about-info__tile-error">
                                {{ t("about.update-error") }}
                            </div>
                        </div>
                    </div>
                    <div class="block-container about-info__versions__tile">
                        <h3>{{ t("about.api") }}</h3>
                        <div v-if="apiTileData.isLoading" class="about-info__tile-checking">
                            {{ t("loading") }}
                        </div>
                        <div v-else class="about-info__tile-body">
                            <div class="about-info__tile-row">
                                <span class="about-info__tile-label">{{ t("about.current") }}</span>
                                <span
                                    class="about-info__tile-value"
                                    :class="{
                                        'about-info__tile-value--muted': apiTileData.currentVersion === t('about.backend-version-unknown'),
                                    }"
                                    >{{ apiTileData.currentVersion }}</span
                                >
                            </div>
                            <div class="about-info__tile-row">
                                <span class="about-info__tile-label">{{ t("about.latest") }}</span>
                                <span
                                    class="about-info__tile-value"
                                    :class="{
                                        'about-info__tile-value--muted': apiTileData.latestVersion === t('about.backend-version-unknown'),
                                    }"
                                    >{{ apiTileData.latestVersion }}</span
                                >
                            </div>
                            <div v-if="apiTileData.isUpToDate" class="about-info__tile-check">
                                <span class="about-info__tile-checkmark">&#10003;</span>
                                {{ t("about.up-to-date") }}
                            </div>
                            <div v-else-if="apiTileData.error" class="about-info__tile-error">
                                {{ t("about.backend-update-error") }}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section v-if="frontendRelease" class="about-info__changelog">
                <h3 class="page-subtitle">{{ t("about.changelog") }}</h3>
                <div class="block-container block-container--padded">
                    <h1>{{ frontendRelease.tag_name }}</h1>
                    <div v-if="frontendChangelogHtml" class="about-info__changelog-content has-markdown-content" v-html="frontendChangelogHtml"></div>
                    <p v-else class="about-info__no-notes">
                        {{ t("about.no-release-notes") }}
                    </p>
                </div>
            </section>

            <section v-if="backendRelease" class="about-info__changelog">
                <h3 class="page-subtitle">
                    {{ t("about.backend-changelog") }}
                </h3>
                <div class="block-container block-container--padded">
                    <h1>{{ backendRelease.tag_name }}</h1>
                    <div v-if="backendChangelogHtml" class="about-info__changelog-content has-markdown-content" v-html="backendChangelogHtml"></div>
                    <p v-else class="about-info__no-notes">
                        {{ t("about.backend-no-release-notes") }}
                    </p>
                </div>
            </section>

            <p v-else-if="!isChecking && backendReleaseError" class="about-info__no-notes">
                {{ t("about.backend-update-error") }}
            </p>
        </div>
    </div>
</template>

<style scoped>
.about-info {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-6);
}

.about-info__version {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
}

.about-info__versions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--gap-size-4);
}

.about-info__versions__tile {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
    padding: var(--gap-size-3);
}

@media (max-width: 600px) {
    .about-info__versions {
        grid-template-columns: 1fr;
    }
}

.about-info__tile-body {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.about-info__tile-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--gap-size-2);
}

.about-info__tile-label {
    color: var(--clr-text-muted);
    font-size: 0.9em;
}

.about-info__tile-value {
    font-weight: 600;
    font-size: 1.05em;
}

.about-info__tile-value--muted {
    font-weight: 400;
    color: var(--clr-text-muted);
    font-style: italic;
}

.about-info__tile-check {
    display: flex;
    align-items: center;
    gap: var(--gap-size-1);
    padding-top: var(--gap-size-1);
    color: var(--clr-accent, #4a9eff);
    font-size: 0.9em;
    font-weight: 500;
}

.about-info__tile-checkmark {
    font-size: 1.2em;
    line-height: 0;
    color: var(--clr-accent, #4a9eff);
}

.about-info__tile-checking {
    color: var(--clr-text-muted);
    font-style: italic;
    font-size: 0.9em;
}

.about-info__tile-error {
    color: var(--clr-text-muted);
    font-style: italic;
    font-size: 0.9em;
}

.about-info__current {
    display: flex;
    align-items: center;
    gap: var(--gap-size-2);
}

.about-info__label {
    color: var(--clr-text-muted);
}

.about-info__value {
    font-weight: 600;
    font-size: 1.1em;
}

.about-info__status {
    padding: 8px 12px;
    border-radius: var(--radius-2);
    background-color: var(--clr-gray-800);
    font-size: 0.95em;
}

.dark-theme .about-info__status {
    background-color: var(--clr-gray-800);
}

.about-info__status--update {
    border-left: 3px solid var(--clr-accent, #4a9eff);
    background-color: var(--clr-accent-bg, rgba(74, 158, 255, 0.1));
}

.dark-theme .about-info__status--update {
    background-color: var(--clr-accent-bg, rgba(74, 158, 255, 0.15));
}

.about-info__status a {
    font-weight: 600;
}

.about-info__check-btn {
    align-self: flex-start;
}

.about-info__changelog {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
}

.about-info__changelog-content {
    line-height: 1.6;
    font-size: 0.95em;
}

.about-info__no-notes {
    color: var(--clr-text-muted);
    font-style: italic;
}

@media (max-width: 600px) {
    .about-info__current {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--gap-size-1);
    }
}
</style>
