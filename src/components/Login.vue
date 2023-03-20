<template>
    <div class="login-page">
        <Logo></Logo>
        <form @submit.prevent="login">
            <OverlayLoader v-if="isLoading"></OverlayLoader>
            <div class="form-group">
                <label class="form-label" for="email">Email:</label>
                <input class="form-input" type="email" id="email" v-model="email" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="password">Password:</label>
                <input class="form-input" type="password" id="password" v-model="password" required>
            </div>
            <div class="server-status">
                <div class="server-status__title">Bar Assistant server:</div>
                <a :href="baServer" target="_blank" class="server-status__url">{{ baServer }}</a>
                <div class="server-status__status">
                    <template v-if="baServerAvailable">
                        Status: Available &middot; {{ server.version }}
                    </template>
                    <template v-else>
                        Status: Not available
                    </template>
                </div>
            </div>
            <!-- <div class="server-status">
                <div class="server-status__title">Meilisearch server:</div>
                <a :href="server.meilisearch_host" target="_blank" class="server-status__url">{{ server.meilisearch_host }}</a>
                <div class="server-status__status">
                    <template v-if="meiliServerAvailable">
                        Status: Available &middot; {{ server.meilisearch_version }}
                    </template>
                    <template v-else>
                        Status: Not available
                    </template>
                </div>
            </div> -->
            <div style="text-align: right; margin-top: 20px;" v-if="baServerAvailable">
                <RouterLink class="button button--outline" :to="{ name: 'register' }">Register</RouterLink>
                <button type="submit" class="button button--dark" style="margin-left: 5px;" :disabled="!baServerAvailable">Login</button>
            </div>
        </form>
    </div>
</template>

<script>
import Auth from '../Auth'
import ApiRequests from '@/ApiRequests';
import OverlayLoader from '@/components/OverlayLoader.vue';
import Logo from '@/components/Logo.vue';

export default {
    data() {
        return {
            isLoading: false,
            email: null,
            password: null,
            baServer: window.srConfig.API_URL,
            meiliServer: window.srConfig.MEILISEARCH_URL,
            server: {},
            meiliServer: {}
        }
    },
    components: {
        OverlayLoader,
        Logo
    },
    created() {
        this.isLoading = true
        ApiRequests.fetchApiVersion().then(data => {
            this.server = data
            this.isLoading = false
            this.isLoading = true
            ApiRequests.checkMeilisearchStatus(this.meiliServer).then(mData => {
                this.meiliServer = mData;
                this.isLoading = false
            }).catch(() => {
                this.isLoading = false
            })
        }).catch(() => {
            this.isLoading = false
        })
    },
    computed: {
        baServerAvailable() {
            return this.server.version != null;
        },
        meiliServerAvailable() {
            return this.meiliServer.status == 'available';
        }
    },
    methods: {
        login() {
            this.isLoading = true
            const redirectPath = this.$route.query.redirect || '/'

            ApiRequests.fetchLoginToken(this.email, this.password).then(token => {
                Auth.rememberToken(token)
                ApiRequests.fetchUser().then(userData => {
                    Auth.rememberUser(userData)

                    this.$router.push(redirectPath);
                })
            }).catch(e => {
                this.isLoading = false
                this.$toast.error(e.message)
            });
        }
    }
}
</script>

<style scoped>
.server-status {
    background: #fff;
    margin-bottom: 1rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    border: 2px solid var(--clr-gray-200);
}

.server-status__title {
    font-size: 0.75rem;
}

.server-status__url {
    font-weight: var(--fw-bold);
}

.server-status__status {
    font-size: 0.85rem;
}
</style>
