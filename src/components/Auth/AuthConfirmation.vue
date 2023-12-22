<template>
    <div></div>
</template>

<script>
import ApiRequests from './../../ApiRequests.js'

export default {
    data() {
        return {
            isLoading: false,
        }
    },
    created() {
        this.isLoading = true
        ApiRequests.confirmAccount(this.$route.params.id, this.$route.params.hash).then(() => {
            this.$toast.default(this.$t('auth.account-confirmed'))
            this.$router.push('/login')
        }).catch(e => {
            this.isLoading = false
            this.$toast.error(e.message)
            this.$router.push('/login')
        })
    }
}
</script>
