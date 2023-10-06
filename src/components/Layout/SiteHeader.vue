<template>
    <div class="site-header-wrapper">
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
                                <a class="header-bar__navigation__link" href="#" @click.prevent="showSearchDialog = !showSearchDialog">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" />
                                    </svg>
                                    {{ $t('search.title') }}
                                </a>
                            </template>
                            <template #dialog>
                                <SiteAutocomplete @close-autocomplete="showSearchDialog = false"></SiteAutocomplete>
                            </template>
                        </SaltRimDialog>
                    </template>
                    <SaltRimDropdown>
                        <template #default="{ toggleDropdown }">
                            <a class="header-bar__navigation__link" href="#" @click.prevent="toggleDropdown">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                                    <path d="M20 22H18V20C18 18.3431 16.6569 17 15 17H9C7.34315 17 6 18.3431 6 20V22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13ZM12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"></path>
                                </svg>
                                {{ appState.user.name }}
                            </a>
                        </template>
                        <template #content>
                            <RouterLink class="dropdown-menu__item" :to="{ name: 'settings.profile' }">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path d="M20 22H18V20C18 18.3431 16.6569 17 15 17H9C7.34315 17 6 18.3431 6 20V22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13ZM12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"></path>
                                </svg>
                                {{ $t('profile') }}
                            </RouterLink>
                            <RouterLink class="dropdown-menu__item" :to="{ name: 'bars' }">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path d="M21 19H23V21H1V19H3V4C3 3.44772 3.44772 3 4 3H14C14.5523 3 15 3.44772 15 4V19H19V11H17V9H20C20.5523 9 21 9.44772 21 10V19ZM5 5V19H13V5H5ZM7 11H11V13H7V11ZM7 7H11V9H7V7Z"></path>
                                </svg>
                                {{ $t('bars.title') }}
                            </RouterLink>
                            <a class="dropdown-menu__item" href="#logout" @click.prevent="logout">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                                    <path d="M5 11H13V13H5V16L0 12L5 8V11ZM3.99927 18H6.70835C8.11862 19.2447 9.97111 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.97111 4 8.11862 4.75527 6.70835 6H3.99927C5.82368 3.57111 8.72836 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C8.72836 22 5.82368 20.4289 3.99927 18Z"></path>
                                </svg>
                                {{ $t('logout') }}
                            </a>
                        </template>
                    </SaltRimDropdown>
                </nav>
            </div>
        </header>
        <nav v-if="appState.bar.id" class="subnavigation-bar">
            <div class="subnavigation-bar__nav">
                <RouterLink :to="{ name: 'home' }" exact-active-class="current-nav">{{ $t('shelf.title') }}</RouterLink>
                <RouterLink :to="{ name: 'cocktails' }" :class="{ 'current-nav': $route.path.startsWith('/cocktails') }">{{ $t('cocktails') }}</RouterLink>
                <RouterLink :to="{ name: 'ingredients' }" :class="{ 'current-nav': $route.path.startsWith('/ingredients') }">{{ $t('ingredients') }}</RouterLink>
                <RouterLink :to="{ name: 'collections.cocktails' }" :class="{ 'current-nav': $route.path.startsWith('/collections') }">{{ $t('collections.title') }}</RouterLink>
                <RouterLink :to="{ name: 'settings' }" :class="{ 'current-nav': $route.path.startsWith('/settings') }">{{ $t('settings') }}</RouterLink>
            </div>
        </nav>
    </div>
</template>
<script>
import ApiRequests from './../../ApiRequests'
import SiteAutocomplete from './../SiteAutocomplete.vue'
import SaltRimDialog from './../Dialog/SaltRimDialog.vue'
import SiteLogo from './../Layout/SiteLogo.vue'
import ThemeToggle from './../ThemeToggle.vue'
import AppState from '../../AppState'
import SaltRimDropdown from './../SaltRimDropdown.vue'

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
.site-header-wrapper {
    margin-bottom: 1rem;
}

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

.header-bar__navigation__link {
    display: block;
    padding: 5px 10px;
    font-size: 1rem;
    text-decoration: none;
    font-weight: 700;
    color: rgba(255, 255, 255, .8);
}

.header-bar__navigation__link:hover,
.header-bar__navigation__link:focus,
.header-bar__navigation__link:active {
    color: #fff;
}

.header-bar__navigation__link.current-nav {
    border-radius: var(--radius-1);
    color: #fff;
    background-color: rgba(0, 0, 0, .3);
}

.header-bar__navigation__link span {
    font-size: 0.7rem;
    border: 1px solid #fff;
    padding: 1px 3px;
    border-radius: var(--radius-1);
    opacity: .6;
}

.header-bar__navigation__link svg {
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

.subnavigation-bar {
    background-color: var(--color-site-header-subnavigation);
}

.subnavigation-bar__nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    max-width: var(--site-width);
    margin: 0 auto;
}

.subnavigation-bar__nav>a {
    display: block;
    padding: 0.5rem 1.25rem;
    font-size: 1rem;
    text-decoration: none;
    font-weight: 700;
    color: rgba(255, 255, 255, .7);
}

.subnavigation-bar__nav>a:hover {
    color: #fff;
}

.subnavigation-bar__nav>a.current-nav {
    color: #fff;
    background-color: rgba(0, 0, 0, 0.25);
}

@media (max-width: 450px) {
    .header-bar {
        padding: 10px;
    }

    .subnavigation-bar__nav {
        justify-content: center;
    }

    .subnavigation-bar__nav>a {
        padding: 0.25rem 0.75rem;
    }
}
</style>
