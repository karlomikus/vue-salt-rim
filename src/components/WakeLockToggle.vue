<template>
    <div v-if="isSupported" class="form-group form-group--wakelock">
        <label class="form-checkbox" for="toggle-wake-lock">
            <input id="toggle-wake-lock" v-model="isActive" type="checkbox" :value="true" @change="toggleWakeLock($event)">
            <span>{{ $t('wakelock-toggle') }}</span>
        </label>
    </div>
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
                await this.initWakeLock()
                this.isActive = true
            }
        }
    },
    onBeforeUnmount() {
        this.wakeLock.release()
        this.isActive = false
    },
    methods: {
        async initWakeLock() {
            try {
                const wakeLock = await navigator.wakeLock.request()
                this.wakeLock = wakeLock
            } catch (err) {
                console.error(err)
            }
        },
        async toggleWakeLock() {
            if (this.isActive) {
                await this.initWakeLock()
            } else {
                this.wakeLock.release()
            }
        },
    }
}
</script>

<style scoped>
.form-group--wakelock {
    font-size: 0.85rem;
}

.form-group--wakelock input {
    min-width: auto;
    min-height: auto;
}
</style>