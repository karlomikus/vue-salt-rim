<template>
    <button type="button" class="button button--small button--wakelock" @click="toggleWakeLock" v-if="isSupported">
        <span>{{ $t('wakelock-toggle') }}</span>
        <svg v-if="!isActive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM5 5V19H19V5H5Z"></path></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M4 3H20C20.5523 3 21 3.44772 21 4V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3ZM11.0026 16L18.0737 8.92893L16.6595 7.51472L11.0026 13.1716L8.17421 10.3431L6.75999 11.7574L11.0026 16Z"></path></svg>
    </button>
</template>

<script>
export default {
    data() {
        return {
            isActive: false,
            wakeLock: null,
            isSupported: navigator && 'wakeLock' in navigator,
        }
    },
    async created() {
        if (this.isSupported) {
            if (this.wakeLock !== null && document.visibilityState === 'visible') {
                await this.initWakeLock();
                this.isActive = true
            }
        }
    },
    methods: {
        async initWakeLock() {
            try {
                const wakeLock = await navigator.wakeLock.request();
                this.wakeLock = wakeLock
            } catch (err) {
                console.error(`${err.name}, ${err.message}`);
            }
        },
        async toggleWakeLock() {
            if (this.isActive === false) {
                await this.initWakeLock()
                this.isActive = true
            } else {
                this.wakeLock.release()
                this.isActive = false
            }
        },
    }
}
</script>

<style scoped>
.button--wakelock {
    padding: 0.10rem 0.35rem;
    display: flex;
    gap: var(--gap-size-1);
    background-color: var(--clr-gray-200);
    color: var(--clr-gray-800);
    margin-bottom: var(--gap-size-2);
}
.button--wakelock:hover {
    background-color: var(--clr-gray-300);
}
</style>
