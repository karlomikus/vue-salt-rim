<template>
    <div class="form-group form-group--wakelock" v-if="isSupported">
        <label class="form-checkbox" for="toggle-wake-lock">
            <input id="toggle-wake-lock" v-model="isActive" @change="toggleWakeLock($event)" type="checkbox" :value="true">
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
                await this.initWakeLock();
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
                const wakeLock = await navigator.wakeLock.request();
                this.wakeLock = wakeLock
            } catch (err) { }
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