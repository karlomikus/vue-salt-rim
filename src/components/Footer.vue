<template>
    <footer class="site-footer-wrapper">
        <div class="site-footer">
            <div class="site-footer__left">
                <a target="_blank" href="https://github.com/karlomikus/bar-assistant">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2C6.475 2 2 6.475 2 12a9.994 9.994 0 0 0 6.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.288-.6-1.175-1.025-1.413-.35-.187-.85-.65-.013-.662.788-.013 1.35.725 1.538 1.025.9 1.512 2.338 1.087 2.912.825.088-.65.35-1.087.638-1.337-2.225-.25-4.55-1.113-4.55-4.938 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.275.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10z"/></svg>
                    Bar Assistant
                </a>
                <a target="_blank" href="https://github.com/karlomikus/vue-salt-rim">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 2C6.475 2 2 6.475 2 12a9.994 9.994 0 0 0 6.838 9.488c.5.087.687-.213.687-.476 0-.237-.013-1.024-.013-1.862-2.512.463-3.162-.612-3.362-1.175-.113-.288-.6-1.175-1.025-1.413-.35-.187-.85-.65-.013-.662.788-.013 1.35.725 1.538 1.025.9 1.512 2.338 1.087 2.912.825.088-.65.35-1.087.638-1.337-2.225-.25-4.55-1.113-4.55-4.938 0-1.088.387-1.987 1.025-2.688-.1-.25-.45-1.275.1-2.65 0 0 .837-.262 2.75 1.026a9.28 9.28 0 0 1 2.5-.338c.85 0 1.7.112 2.5.337 1.912-1.3 2.75-1.024 2.75-1.024.55 1.375.2 2.4.1 2.65.637.7 1.025 1.587 1.025 2.687 0 3.838-2.337 4.688-4.562 4.938.362.312.675.912.675 1.85 0 1.337-.013 2.412-.013 2.75 0 .262.188.574.688.474A10.016 10.016 0 0 0 22 12c0-5.525-4.475-10-10-10z"/></svg>
                    Salt Rim
                </a>
                <a target="_blank" href="https://karlomikus.com">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 29" width="20" height="20" fill="#000">
                        <path d="m42.335 28.898-8.131-14.033h-.548l-8.131 14.033-8.131-14.033h-.647L8.615 28.898 0 14.033h9.269L17.4 0l8.131 14.033h.306L33.968 0 42.1 14.033h8.85l-8.615 14.865z"></path>
                    </svg>
                    Made by KaMi
                </a>
            </div>
            <div class="site-footer__right">
                {{ clientVersion }}
                <br>
                {{ apiVersion }}
                <br>
                {{ meiliVersion }}
            </div>
        </div>
    </footer>
</template>

<script>
import ApiRequests from '@/ApiRequests';

export default {
    data() {
        return {
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
            this.versions.api = 'Fetch error';
            this.versions = 'Fetch error';
        })
    }
}
</script>

<style scoped>
.site-footer-wrapper {
    --clr-footer-bg: #fff;
    --clr-footer-link: var(--clr-gray-500);
    --clr-footer-link-hover: var(--clr-red-800);
}

.dark-theme .site-footer-wrapper {
    --clr-footer-bg: var(--clr-dark-main-900);
    --clr-footer-link: var(--clr-dark-main-400);
    --clr-footer-link-hover: var(--clr-red-300);
}

.site-footer-wrapper {
    background-color: var(--clr-footer-bg);
    margin-top: 20px;
}

.site-footer {
    margin: 0 auto;
    max-width: var(--site-width);
    padding: 20px 20px;
    display: flex;
    font-size: 0.8rem;
}

.site-footer__left {
    display: flex;
    flex-direction: column;
}

.site-footer__left a {
    display: flex;
    margin-bottom: 5px;
    text-decoration: none;
    color: var(--clr-footer-link);
}

.site-footer__left a svg {
    margin-right: 5px;
    fill: var(--clr-footer-link);
}

.site-footer__left a:hover svg {
    margin-right: 5px;
    fill: var(--clr-footer-link-hover);
}

.site-footer__left a:hover,
.site-footer__left a:active,
.site-footer__left a:focus {
    color: var(--clr-footer-link-hover)
}

.site-footer__right {
    margin-left: auto;
    text-align: right;
}
</style>
