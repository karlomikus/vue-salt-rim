<template>
    <div v-if="isSupported" class="form-group form-group--wakelock">
        <label class="form-checkbox" for="toggle-wake-lock">
            <input id="toggle-wake-lock" v-model="isActive" type="checkbox" :value="true" @change="toggleWakeLock()" />
            <span>{{ $t("wakelock-toggle") }}</span>
        </label>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";

const isSupported: boolean = typeof navigator !== "undefined" && "wakeLock" in navigator;

const wakeLock = ref<WakeLockSentinel | null>(null);
const isActive = ref<boolean>(false);

async function initWakeLock(): Promise<void> {
    try {
        const sentinel = await navigator.wakeLock.request("screen");
        wakeLock.value = sentinel;
    } catch (err) {
        console.error(err);
    }
}

async function toggleWakeLock(): Promise<void> {
    if (isActive.value) {
        await initWakeLock();
    } else {
        wakeLock.value?.release();
    }
}

onMounted(async () => {
    if (isSupported) {
        if (wakeLock.value !== null && document.visibilityState === "visible") {
            await initWakeLock();
            isActive.value = true;
        }
    }
});

onBeforeUnmount(() => {
    wakeLock.value?.release();
    isActive.value = false;
});
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
