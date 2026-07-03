<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BarAssistantClient from '@/api/BarAssistantClient';
import { useGitHubReleases } from '@/composables/useGitHubReleases';
import type { components } from '@/api/api';

type ServerVersion = components['schemas']['ServerVersion'];

const { t } = useI18n();

const currentVersion = ref<string>(window.srConfig.VERSION ?? '');
const isDev = computed<boolean>(() => {
    return !currentVersion.value || currentVersion.value === 'dev';
});

// Frontend client release (vue-salt-rim)
const {
    release: frontendRelease,
    isLoading: frontendLoading,
    error: frontendError,
    changelogHtml: frontendChangelogHtml,
    fetch: fetchFrontendRelease,
} = useGitHubReleases('karlomikus/vue-salt-rim');

// Backend API release notes (bar-assistant)
const {
    release: backendRelease,
    isLoading: backendReleaseLoading,
    error: backendReleaseError,
    changelogHtml: backendChangelogHtml,
    fetch: fetchBackendRelease,
} = useGitHubReleases('karlomikus/bar-assistant');

// Connected backend version (from the API)
const backendVersion = ref<ServerVersion | null>(null);
const backendVersionError = ref<string>('');

const isChecking = ref<boolean>(false);

function parseSemver(version: string): number[] | null {
    const cleaned = version.replace(/^v/, '');
    const parts = cleaned.split('.');
    if (parts.length < 2) return null;
    const nums = parts.map(Number);
    if (nums.some(isNaN)) return null;
    return nums;
}

const frontendUpdateStatus = computed<'newer' | 'current' | 'dev' | 'error' | 'checking'>(() => {
    if (isChecking.value) return 'checking';
    if (frontendError.value && !frontendRelease.value) return 'error';
    if (isDev.value) return 'dev';
    if (!frontendRelease.value) return 'error';

    const running = parseSemver(currentVersion.value);
    const latest = parseSemver(frontendRelease.value.tag_name);

    if (!running || !latest) return 'dev';

    for (let i = 0; i < Math.max(running.length, latest.length); i++) {
        const r = running[i] ?? 0;
        const l = latest[i] ?? 0;
        if (l > r) return 'newer';
        if (r > l) return 'current';
    }
    return 'current';
});

const backendUpdateStatus = computed<'up-to-date' | 'update-available' | 'unknown' | 'error' | 'checking'>(() => {
    if (isChecking.value && !backendVersion.value && !backendVersionError.value) return 'checking';
    if (backendVersionError.value && !backendVersion.value) return 'error';
    if (!backendVersion.value) return 'unknown';
    if (backendVersion.value.is_latest) return 'up-to-date';
    if (backendVersion.value.latest_version) return 'update-available';
    return 'unknown';
});

const BACKEND_RELEASES_URL = 'https://github.com/karlomikus/bar-assistant/releases';

async function fetchBackendVersion(): Promise<void> {
    backendVersionError.value = '';
    try {
        const response = await BarAssistantClient.getServerVersion();
        backendVersion.value = response?.data ?? null;
    } catch {
        backendVersion.value = null;
        backendVersionError.value = 'fetch-error';
    }
}

async function checkForUpdates(): Promise<void> {
    isChecking.value = true;
    try {
        await Promise.allSettled([
            fetchFrontendRelease(),
            fetchBackendVersion(),
            fetchBackendRelease(),
        ]);
    } finally {
        isChecking.value = false;
    }
}

onMounted(() => {
    checkForUpdates();
});
</script>

<template>
    <div class="about-info">
        <section class="about-info__version">
            <h2 class="page-subtitle">{{ t('about.title') }}</h2>

            <div class="about-info__current">
                <span class="about-info__label">{{ t('about.version') }}</span>
                <span class="about-info__value">
                    <template v-if="isDev">
                        {{ t('about.dev-version') }}
                    </template>
                    <template v-else>
                        {{ currentVersion }}
                    </template>
                </span>
            </div>

            <div v-if="isChecking" class="about-info__status about-info__status--checking">
                {{ t('loading') }}
            </div>

            <div v-else-if="frontendUpdateStatus === 'error' && !frontendRelease" class="about-info__status">
                {{ t('about.update-error') }}
            </div>

            <div v-else-if="frontendUpdateStatus === 'newer'" class="about-info__status about-info__status--update">
                {{ t('about.update-available') }}:
                <a :href="frontendRelease!.html_url" target="_blank" rel="noopener noreferrer">
                    {{ frontendRelease!.tag_name }}
                </a>
            </div>

            <div v-else-if="frontendUpdateStatus === 'current'" class="about-info__status">
                {{ t('about.up-to-date') }}
            </div>

            <div v-else-if="frontendUpdateStatus === 'dev'" class="about-info__status">
                <template v-if="frontendRelease">
                    {{ t('about.latest-version') }}:
                    <a :href="frontendRelease.html_url" target="_blank" rel="noopener noreferrer">
                        {{ frontendRelease.tag_name }}
                    </a>
                </template>
            </div>

            <button
                class="btn about-info__check-btn"
                :disabled="isChecking"
                @click="checkForUpdates"
            >
                {{ isChecking ? t('loading') + '...' : t('about.check-updates') }}
            </button>
        </section>

        <section class="about-info__version about-info__backend">
            <h2 class="page-subtitle">{{ t('about.backend-version') }}</h2>

            <div class="about-info__current">
                <span class="about-info__label">{{ t('about.version') }}</span>
                <span class="about-info__value">
                    <template v-if="backendVersion">
                        {{ backendVersion.version }}
                    </template>
                    <template v-else>
                        {{ t('about.backend-version-unknown') }}
                    </template>
                </span>
            </div>

            <div v-if="isChecking && backendUpdateStatus === 'checking'" class="about-info__status about-info__status--checking">
                {{ t('loading') }}
            </div>

            <div v-else-if="backendUpdateStatus === 'error'" class="about-info__status">
                {{ t('about.backend-update-error') }}
            </div>

            <div v-else-if="backendUpdateStatus === 'update-available'" class="about-info__status about-info__status--update">
                {{ t('about.backend-update-available') }}:
                <a :href="BACKEND_RELEASES_URL" target="_blank" rel="noopener noreferrer">
                    {{ backendVersion!.latest_version }}
                </a>
            </div>

            <div v-else-if="backendUpdateStatus === 'up-to-date'" class="about-info__status">
                {{ t('about.backend-up-to-date') }}
            </div>

            <div v-else-if="backendUpdateStatus === 'unknown'" class="about-info__status">
                {{ t('about.backend-version-unknown') }}
            </div>
        </section>

        <section v-if="frontendRelease" class="about-info__changelog">
            <h3 class="page-subtitle">{{ t('about.changelog') }}</h3>
            <div
                v-if="frontendChangelogHtml"
                class="about-info__changelog-content"
                v-html="frontendChangelogHtml"
            ></div>
            <p v-else class="about-info__no-notes">
                {{ t('about.no-release-notes') }}
            </p>
        </section>

        <section v-if="backendRelease" class="about-info__changelog">
            <h3 class="page-subtitle">{{ t('about.backend-changelog') }}</h3>
            <div
                v-if="backendChangelogHtml"
                class="about-info__changelog-content"
                v-html="backendChangelogHtml"
            ></div>
            <p v-else class="about-info__no-notes">
                {{ t('about.backend-no-release-notes') }}
            </p>
        </section>

        <p v-else-if="!isChecking && backendReleaseError" class="about-info__no-notes">
            {{ t('about.backend-update-error') }}
        </p>
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

.about-info__changelog-content :deep(h1),
.about-info__changelog-content :deep(h2),
.about-info__changelog-content :deep(h3),
.about-info__changelog-content :deep(h4) {
    margin-top: 1.2em;
    margin-bottom: 0.4em;
    font-size: 1rem;
    font-weight: 600;
}

.about-info__changelog-content :deep(h1) { font-size: 1.2rem; }
.about-info__changelog-content :deep(h2) { font-size: 1.1rem; }

.about-info__changelog-content :deep(ul),
.about-info__changelog-content :deep(ol) {
    padding-left: 1.5em;
    margin: 0.5em 0;
}

.about-info__changelog-content :deep(li) {
    margin-bottom: 0.25em;
}

.about-info__changelog-content :deep(code) {
    background-color: var(--clr-gray-700);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 0.9em;
}

.about-info__changelog-content :deep(pre) {
    background-color: var(--clr-gray-700);
    padding: 10px;
    border-radius: var(--radius-2);
    overflow-x: auto;
    margin: 0.5em 0;
}

.about-info__changelog-content :deep(pre code) {
    background: none;
    padding: 0;
}

.about-info__changelog-content :deep(a) {
    color: var(--clr-accent, #4a9eff);
}

.about-info__changelog-content :deep(blockquote) {
    border-left: 2px solid var(--clr-gray-600);
    padding-left: 1em;
    margin: 0.5em 0;
    color: var(--clr-text-muted);
}

.about-info__changelog-content :deep(p) {
    margin: 0.5em 0;
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