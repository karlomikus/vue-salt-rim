<template>
    <header class="site-header">
        <div class="header-bar">
            <RouterLink to="/" class="site-logo">
                <div class="site-logo__image">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M11 19v-5.111L3 5V3h18v2l-8 8.889V19h5v2H6v-2h5zM7.49 7h9.02l1.8-2H5.69l1.8 2z" />
                    </svg>
                </div>
                <h1 class="site-logo__title">
                    Salt Rim
                    <span>Your personal bar assistant</span>
                </h1>
            </RouterLink>
            <nav class="header-bar__navigation">
                <Dialog v-model="searchShown">
                    <template #trigger>
                        <a href="#" @click.prevent="searchShown = !searchShown">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="12" height="12">
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" />
                            </svg>
                            Search
                        </a>
                    </template>
                    <template #dialog>
                        <SiteAutocomplete @closeAutocomplete="searchShown = false" />
                    </template>
                </Dialog>
                <RouterLink :to="{name: 'home'}" exact-active-class="current-nav">Shelf</RouterLink>
                <RouterLink :to="{name: 'cocktails'}" :class="{ 'current-nav': $route.path.startsWith('/cocktails') }">Cocktails</RouterLink>
                <RouterLink :to="{name: 'ingredients'}" :class="{ 'current-nav': $route.path.startsWith('/ingredients') }">Ingredients</RouterLink>
                <RouterLink :to="{name: 'settings'}" :class="{ 'current-nav': $route.path.startsWith('/settings') }">Settings</RouterLink>
                <a href="#" @click.prevent="logout">Logout</a>
            </nav>
        </div>
    </header>
</template>
<script>
import ApiRequests from '@/ApiRequests';
import Auth from '@/Auth.js';
import SiteAutocomplete from '@/components/SiteAutocomplete.vue'
import Dialog from '@/components/Dialog/Dialog.vue'

export default {
    components: {
        SiteAutocomplete,
        Dialog
    },
    data() {
        return {
            searchShown: false,
        }
    },
    created() {
        document.addEventListener('keydown', evt => {
            if (evt.ctrlKey && evt.key === "k") {
                evt.preventDefault()
                this.searchShown = !this.searchShown;
            }
        })
    },
    methods: {
        logout() {
            ApiRequests.logout().then(() => {
                Auth.forgetUser();
                this.$router.push({name: 'login'})
            })
        }
    }
}
</script>
<style scoped>
.site-header {
    margin-bottom: 30px;
    background-color: var(--color-site-header);
}

.header-bar {
    padding: 20px 10px;
    display: flex;
    max-width: var(--site-width);
    margin: 0 auto;
}

.header-bar__navigation {
    margin-left: auto;
    display: flex;
    flex-wrap: wrap;
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
    text-decoration: underline;
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
    .site-logo {
        justify-content: center;
    }

    .header-bar {
        flex-direction: column;
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
</style>
