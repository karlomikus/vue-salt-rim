<template>
    <footer class="site-footer-wrapper">
        <div class="site-footer">
            <div class="site-footer__links">
                <a target="_blank" href="https://barassistant.app">Bar Assistant</a>
                <span>&middot;</span>
                <a target="_blank" href="https://docs.barassistant.app/">Docs</a>
                <span>&middot;</span>
                <a target="_blank" href="https://github.com/karlomikus/bar-assistant">GitHub</a>
                <template v-if="appState.isBillingEnabled()">
                    <span>&middot;</span>
                    <a target="_blank" href="https://barassistant.app/terms.html"> Terms </a>
                    <span>&middot;</span>
                    <a target="_blank" href="https://barassistant.app/privacy.html"> Privacy policy </a>
                </template>
            </div>
            <div class="site-footer__notes">
                <p>
                    <strong>Please drink responsibly.</strong> This app is intended for adults of legal drinking age. Never drink and drive, and
                    don't drink if you are pregnant or have a medical condition that makes alcohol unsafe. Alcohol affects everyone
                    differently, know your limits.
                    See how some ingredients react in cocktails by visiting <a target="_blank" href="https://www.cocktailsafe.org/">Cocktail safety</a>.
                </p>
                <p>
                    Recipes here come from many different sources and may vary in ingredients, measurements, and technique. Where the original
                    source is known, we credit the author and link back to it. If you believe a recipe is credited incorrectly or used without
                    permission, please <a target="_blank" href="https://github.com/karlomikus/bar-assistant/issues">let us know</a> so we can fix
                    it.
                </p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import AppState from "@/AppState";

const appState = new AppState();
</script>

<style scoped>
.site-footer-wrapper {
    --clr-footer-link: var(--clr-gray-500);
    --clr-footer-link-hover: var(--clr-accent-800);
}

.dark-theme .site-footer-wrapper {
    --clr-footer-link: var(--clr-gray-400);
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

.site-footer__notes {
    margin: 0.75rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    line-height: 1.5;
    color: var(--clr-gray-500);
}

.dark-theme .site-footer__notes {
    color: var(--clr-gray-400);
}

.site-footer__notes p {
    margin: 0;
}

.site-footer__notes strong {
    color: var(--clr-gray-700);
}

.dark-theme .site-footer__notes strong {
    color: var(--clr-gray-300);
}

.site-footer a {
    color: var(--clr-footer-link);
}

.site-footer a:hover,
.site-footer a:active,
.site-footer a:focus {
    color: var(--clr-footer-link-hover);
}

@media (max-width: 750px) {
    .site-footer-wrapper {
        padding-bottom: calc(4.75rem + env(safe-area-inset-bottom));
    }
}
</style>
