<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { micromark } from 'micromark';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

interface GitHubRelease {
    tag_name: string;
    name: string;
    html_url: string;
    body: string;
    published_at: string;
}

const currentVersion = ref<string>(window.srConfig.VERSION ?? '');
const latestRelease = ref<GitHubRelease | null>(null);
const isChecking = ref<boolean>(false);
const fetchError = ref<string>('');
const isDev = computed<boolean>(() => {
    return !currentVersion.value || currentVersion.value === 'dev';
});

function parseSemver(version: string): number[] | null {
    const cleaned = version.replace(/^v/, '');
    const parts = cleaned.split('.');
    if (parts.length < 2) return null;
    const nums = parts.map(Number);
    if (nums.some(isNaN)) return null;
    return nums;
}

const updateStatus = computed<'newer' | 'current' | 'dev' | 'error' | 'checking'>(() => {
    if (isChecking.value) return 'checking';
    if (fetchError.value) return 'error';
    if (isDev.value) return 'dev';
    if (!latestRelease.value) return 'error';

    const running = parseSemver(currentVersion.value);
    const latest = parseSemver(latestRelease.value.tag_name);

    if (!running || !latest) return 'dev';

    for (let i = 0; i < Math.max(running.length, latest.length); i++) {
        const r = running[i] ?? 0;
        const l = latest[i] ?? 0;
        if (l > r) return 'newer';
        if (r > l) return 'current';
    }
    return 'current';
});

const changelogHtml = computed<string>(() => {
    if (!latestRelease.value?.body) return '';
    return micromark(latestRelease.value.body);
});

async function checkForUpdates(): Promise<void> {
    isChecking.value = true;
    fetchError.value = '';

    try {
        const response = await fetch(
            'https://api.github.com/repos/karlomikus/vue-salt-rim/releases?per_page=1',
        );

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }

        const releases: GitHubRelease[] = await response.json();

        if (releases.length === 0) {
            fetchError.value = t('about.update-error');
            return;
        }

        latestRelease.value = releases[0];
    } catch {
        fetchError.value = t('about.update-error');
    } finally {
        isChecking.value = false;
    }
}

onMounted(() => {
    checkForUpdates();
});
</script>

<template>
    <main class="about-page">
        <section class="about-page__version">
            <h2 class="page-subtitle">{{ t('about.title') }}</h2>

            <div class="about-page__current">
                <span class="about-page__label">{{ t('about.version') }}</span>
                <span class="about-page__value">
                    <template v-if="isDev">
                        {{ t('about.dev-version') }}
                    </template>
                    <template v-else>
                        {{ currentVersion }}
                    </template>
                </span>
            </div>

            <div v-if="isChecking" class="about-page__status about-page__status--checking">
                {{ t('loading') }}
            </div>

            <div v-else-if="updateStatus === 'error' && !latestRelease" class="about-page__status">
                {{ fetchError }}
            </div>

            <div v-else-if="updateStatus === 'newer'" class="about-page__status about-page__status--update">
                {{ t('about.update-available') }}:
                <a :href="latestRelease!.html_url" target="_blank" rel="noopener noreferrer">
                    {{ latestRelease!.tag_name }}
                </a>
            </div>

            <div v-else-if="updateStatus === 'current'" class="about-page__status">
                {{ t('about.up-to-date') }}
            </div>

            <div v-else-if="updateStatus === 'dev'" class="about-page__status">
                <template v-if="latestRelease">
                    {{ t('about.latest-version') }}:
                    <a :href="latestRelease.html_url" target="_blank" rel="noopener noreferrer">
                        {{ latestRelease.tag_name }}
                    </a>
                </template>
            </div>

            <button
                class="btn about-page__check-btn"
                :disabled="isChecking"
                @click="checkForUpdates"
            >
                {{ isChecking ? t('loading') + '...' : t('about.check-updates') }}
            </button>
        </section>

        <section v-if="latestRelease" class="about-page__changelog">
            <h3 class="page-subtitle">{{ t('about.changelog') }}</h3>
            <div
                v-if="changelogHtml"
                class="about-page__changelog-content"
                v-html="changelogHtml"
            ></div>
            <p v-else class="about-page__no-notes">
                {{ t('about.no-release-notes') }}
            </p>
        </section>
    </main>
</template>

<style scoped>
.about-page {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-6);
}

.about-page__version {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
}

.about-page__current {
    display: flex;
    align-items: center;
    gap: var(--gap-size-2);
}

.about-page__label {
    color: var(--clr-text-muted);
}

.about-page__value {
    font-weight: 600;
    font-size: 1.1em;
}

.about-page__status {
    padding: 8px 12px;
    border-radius: var(--radius-2);
    background-color: var(--clr-gray-800);
    font-size: 0.95em;
}

.dark-theme .about-page__status {
    background-color: var(--clr-gray-800);
}

.about-page__status--update {
    border-left: 3px solid var(--clr-accent, #4a9eff);
    background-color: var(--clr-accent-bg, rgba(74, 158, 255, 0.1));
}

.dark-theme .about-page__status--update {
    background-color: var(--clr-accent-bg, rgba(74, 158, 255, 0.15));
}

.about-page__status a {
    font-weight: 600;
}

.about-page__check-btn {
    align-self: flex-start;
}

.about-page__changelog {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-3);
}

.about-page__changelog-content {
    line-height: 1.6;
    font-size: 0.95em;
}

.about-page__changelog-content :deep(h1),
.about-page__changelog-content :deep(h2),
.about-page__changelog-content :deep(h3),
.about-page__changelog-content :deep(h4) {
    margin-top: 1.2em;
    margin-bottom: 0.4em;
    font-size: 1rem;
    font-weight: 600;
}

.about-page__changelog-content :deep(h1) { font-size: 1.2rem; }
.about-page__changelog-content :deep(h2) { font-size: 1.1rem; }

.about-page__changelog-content :deep(ul),
.about-page__changelog-content :deep(ol) {
    padding-left: 1.5em;
    margin: 0.5em 0;
}

.about-page__changelog-content :deep(li) {
    margin-bottom: 0.25em;
}

.about-page__changelog-content :deep(code) {
    background-color: var(--clr-gray-700);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 0.9em;
}

.about-page__changelog-content :deep(pre) {
    background-color: var(--clr-gray-700);
    padding: 10px;
    border-radius: var(--radius-2);
    overflow-x: auto;
    margin: 0.5em 0;
}

.about-page__changelog-content :deep(pre code) {
    background: none;
    padding: 0;
}

.about-page__changelog-content :deep(a) {
    color: var(--clr-accent, #4a9eff);
}

.about-page__changelog-content :deep(blockquote) {
    border-left: 2px solid var(--clr-gray-600);
    padding-left: 1em;
    margin: 0.5em 0;
    color: var(--clr-text-muted);
}

.about-page__changelog-content :deep(p) {
    margin: 0.5em 0;
}

.about-page__no-notes {
    color: var(--clr-text-muted);
    font-style: italic;
}

@media (max-width: 600px) {
    .about-page__current {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--gap-size-1);
    }
}
</style>