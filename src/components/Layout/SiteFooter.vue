<template>
    <footer class="site-footer-wrapper">
        <div class="site-footer">
            <div class="site-footer__links">
                <a target="_blank" href="https://barassistant.app">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 512 512" width="20" height="20">
                        <path d="M512 0H0v512h512V0Z" />
                        <path fill="#fff" d="M420.866 228.925h-117.76l-204.8 143.811h-46.08V49.152h46.08l204.8 143.811h117.76v-89.877h46.08v215.716h-46.08v-89.877Zm-276.48 63.099v-162.16l-46.08-32.359v226.878l46.08-32.359ZM256.003 429.056H44.035v48.128h211.968v-48.128Z" />
                    </svg>
                    Bar Assistant
                </a>
                <template v-if="appState.isBillingEnabled()">
                    &middot;
                    <a target="_blank" href="https://barassistant.app/terms.html">
                        Terms
                    </a>
                    &middot;
                    <a target="_blank" href="https://barassistant.app/privacy.html">
                        Privacy policy
                    </a>
                </template>
            </div>
            <div class="site-footer__versions">
                {{ clientVersion }}
                &middot;
                {{ apiVersion }}
                &middot;
                {{ meiliVersion }}
            </div>
        </div>
    </footer>
</template>

<script>
import AppState from '../../AppState'
import ApiRequests from './../../ApiRequests'

export default {
    data() {
        return {
            appState: new AppState(),
            versions: {
                api: null,
                client: this.app_version,
                meili: null
            }
        }
    },
    computed: {
        clientVersion() {
            return `Salt Rim: ${this.versions.client}`
        },
        apiVersion() {
            return `Bar Assistant: ${this.versions.api}`
        },
        meiliVersion() {
            return `Meilisearch: ${this.versions.meili}`
        }
    },
    created() {
        ApiRequests.fetchApiVersion().then(resp => {
            this.versions.api = resp.version
            this.versions.meili = resp.search_version
        }).catch(() => {
            this.versions.api = 'n/a'
            this.versions = 'n/a'
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
}

.site-footer__links a {
    display: inline-flex;
    text-decoration: none;
    color: var(--clr-footer-link);
}

.site-footer__links a svg {
    margin-right: 5px;
    fill: var(--clr-footer-link);
}

.site-footer__links a:hover svg {
    margin-right: 5px;
    fill: var(--clr-footer-link-hover);
}

.site-footer__links a:hover,
.site-footer__links a:active,
.site-footer__links a:focus {
    color: var(--clr-footer-link-hover)
}
</style>
