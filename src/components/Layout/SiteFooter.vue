<template>
    <footer class="site-footer-wrapper">
        <div class="site-footer">
            <div class="site-footer__links">
                <a target="_blank" href="https://barassistant.app">Bar Assistant</a>
                <span>&middot;</span>
                <a target="_blank" href="https://bar-assistant.github.io/docs/">Docs</a>
                <span>&middot;</span>
                <a target="_blank" href="https://github.com/karlomikus/bar-assistant">GitHub</a>
                <span>&middot;</span>
                <a target="_blank" href="https://www.cocktailsafe.org/">Cocktail safety</a>
                <template v-if="appState.isBillingEnabled()">
                    <span>&middot;</span>
                    <a target="_blank" href="https://barassistant.app/terms.html">
                        Terms
                    </a>
                    <span>&middot;</span>
                    <a target="_blank" href="https://barassistant.app/privacy.html">
                        Privacy policy
                    </a>
                </template>
            </div>
            <div class="site-footer__links">
                <span>Salt Rim: <a href="https://github.com/karlomikus/vue-salt-rim/releases" target="_blank">{{ client }}</a></span>
                <span>&middot;</span>
                <span>Bar Assistant: <a href="https://github.com/karlomikus/bar-assistant/releases" target="_blank">
                    {{ versions.version }}
                    <template v-if="!versions.is_latest">
                        (Update available)
                    </template>
                </a></span>
                <span>&middot;</span>
                <span>Meilisearch: <a href="https://github.com/meilisearch/meilisearch/releases" target="_blank">{{ versions.search_version }}</a></span>
            </div>
        </div>
    </footer>
</template>

<script>
import AppState from '../../AppState'
import BarAssistantClient from '@/api/BarAssistantClient';

export default {
    data() {
        return {
            appState: new AppState(),
            client: window.srConfig.VERSION || 'local',
            versions: {}
        }
    },
    created() {
        BarAssistantClient.getServerVersion().then(resp => {
            this.versions = resp.data
        }).catch(() => {
        })
    }
}
</script>

<style scoped>
.site-footer-wrapper {
    --clr-footer-link: var(--clr-gray-500);
    --clr-footer-link-hover: var(--clr-accent-800);
}

.dark-theme .site-footer-wrapper {
    --clr-footer-link: var(--clr-dark-main-400);
    --clr-footer-link-hover: var(--clr-accent-300);
}

.site-footer-wrapper {
    background-color: var(--clr-site-footer);
    margin-top: 1rem;
}

.site-footer {
    margin: 0 auto;
    max-width: var(--site-width);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    font-size: 0.8rem;
}

.site-footer__links {
    display: flex;
    gap: 0.5rem;
    flex-direction: row;
    flex-wrap: wrap;
}

.site-footer a {
    color: var(--clr-footer-link);
}

.site-footer a:hover,
.site-footer a:active,
.site-footer a:focus {
    color: var(--clr-footer-link-hover)
}
</style>
