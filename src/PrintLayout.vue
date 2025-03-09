<script setup lang="ts">
import { RouterView } from 'vue-router'

function printPage() {
    window.print()
}
</script>

<template>
    <div>
        <RouterView />
        <div class="no-print" style="text-align: center;">
            <button type="button" class="button button--dark" @click="printPage">{{ $t('print') }}</button>
        </div>
    </div>
</template>

