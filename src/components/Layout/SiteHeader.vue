<template>
    <header class="site-header">
        <div class="header-bar">
            <div class="header-bar__left">
                <SiteLogo></SiteLogo>
                <ThemeToggle></ThemeToggle>
            </div>
            <nav class="header-bar__navigation">
                <template v-if="appState.bar.id">
                    <SaltRimDialog v-model="showSearchDialog" class="site-autocomplete-dialog">
                        <template #trigger>
                            <a href="#" @click.prevent="showSearchDialog = !showSearchDialog">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" />
                                </svg>
                                {{ $t('search') }}
                            </a>
                        </template>
                        <template #dialog>
                            <SiteAutocomplete @close-autocomplete="showSearchDialog = false"></SiteAutocomplete>
                        </template>
                    </SaltRimDialog>
                </template>
                <RouterLink :to="{ name: 'bars' }" :class="{ 'current-nav': $route.path.startsWith('/bars') }">{{ $t('bars.title') }}</RouterLink>
                <a v-if="isLoginDisabled !== true" href="#" @click.prevent="logout">{{ $t('logout') }} ({{ appState.user.name }})</a>
            </nav>
        </div>
    </header>
    <nav class="subnavigation-bar" v-if="appState.bar.id">
        <div class="subnavigation-bar__nav">
            <RouterLink :to="{ name: 'home' }" exact-active-class="current-nav">{{ $t('shelf.title') }}</RouterLink>
            <RouterLink :to="{ name: 'cocktails' }" :class="{ 'current-nav': $route.path.startsWith('/cocktails') }">{{ $t('cocktails') }}</RouterLink>
            <RouterLink :to="{ name: 'ingredients' }" :class="{ 'current-nav': $route.path.startsWith('/ingredients') }">{{ $t('ingredients') }}</RouterLink>
            <RouterLink :to="{ name: 'collections.cocktails' }" :class="{ 'current-nav': $route.path.startsWith('/collections') }">{{ $t('collections.title') }}</RouterLink>
            <RouterLink :to="{ name: 'settings' }" :class="{ 'current-nav': $route.path.startsWith('/settings') }">{{ $t('settings') }}</RouterLink>
        </div>
    </nav>
</template>
<script>
import ApiRequests from './../../ApiRequests'
import SiteAutocomplete from './../SiteAutocomplete.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import SiteLogo from './../Layout/SiteLogo.vue'
import ThemeToggle from './../ThemeToggle.vue'
import AppState from '../../AppState'
import SaltRimDropdown from './../SaltRimDropdown.vue';

export default {
    components: {
        SiteAutocomplete,
        SaltRimDialog,
        SiteLogo,
        ThemeToggle,
        SaltRimDropdown,
    },
    data() {
        return {
            appState: new AppState(),
            showSearchDialog: false,
            isLoginDisabled: window.srConfig.DISABLE_LOGIN
        }
    },
    created() {
        document.addEventListener('keydown', evt => {
            if (evt.ctrlKey && evt.key === 'k') {
                evt.preventDefault()
                this.showSearchDialog = !this.showSearchDialog
            }
        })
    },
    methods: {
        logout() {
            this.$confirm(this.$t('auth.confirm-logout'), {
                onResolved: (dialog) => {
                    dialog.close()
                    ApiRequests.logout().then(() => {
                        const appState = new AppState()
                        appState.clear()
                        this.$router.push({ name: 'login' })
                    })
                }
            })
        }
    }
}
</script>
<style scoped>
.site-header {
    background-color: var(--color-site-header);
}

.header-bar {
    padding: 1rem 0.5rem;
    display: flex;
    max-width: var(--site-width);
    margin: 0 auto;
}

.header-bar__left {
    display: flex;
}

.header-bar__navigation {
    margin-left: auto;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}

.header-bar__navigation a {
    display: block;
    padding: 5px 10px;
    font-size: 1rem;
    text-decoration: none;
    font-weight: 700;
    color: rgba(255, 255, 255, .8);
}

.header-bar__navigation a:hover,
.header-bar__navigation a:focus,
.header-bar__navigation a:active {
    color: #fff;
}

.header-bar__navigation a.current-nav {
    border-radius: 3px;
    color: #fff;
    background-color: rgba(0, 0, 0, .3);
}

.header-bar__navigation a span {
    font-size: 0.7rem;
    border: 1px solid #fff;
    padding: 1px 3px;
    border-radius: 2px;
    opacity: .6;
}

.header-bar__navigation a svg {
    fill: #fff;
}

@media (max-width: 750px) {
    .header-bar {
        flex-direction: column;
    }

    .header-bar__left {
        margin: 0 auto;
    }

    .header-bar__navigation {
        /* display: none; */
        margin: 10px 0 0 0;
        justify-content: center;
    }
}

@media (max-width: 450px) {
    .header-bar {
        padding: 10px;
    }

    .site-header {
        margin-bottom: 20px;
    }
}

.subnavigation-bar {
    background-color: #423c62;
    margin-bottom: 1rem;
}

.subnavigation-bar__nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    max-width: var(--site-width);
    margin: 0 auto;
}

.subnavigation-bar__nav > a {
    display: block;
    padding: 0.5rem 1.25rem;
    font-size: 1rem;
    text-decoration: none;
    font-weight: 700;
    color: rgba(255, 255, 255, .7);
}

.subnavigation-bar__nav > a:hover {
    color: #fff;
}

.subnavigation-bar__nav > a.current-nav {
    color: #fff;
    background-color: rgba(0, 0, 0, 0.25);
}
</style>
