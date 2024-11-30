<template>
    <div v-if="!meilisearchRunning" class="status-check">
        Unable to connect to the Meilisearch server at "{{ appState.bar.search_host }}". Some features will be missing.
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppState from '../AppState'

const appState = new AppState()
const meilisearchRunning = ref(true)

function testMeilisearch() {
    fetch(`${appState.bar.search_host}/health`)
        .then(res => res.json())
        .then(data => {
            if (data.status !== 'available') {
                meilisearchRunning.value = false
            }
        })
        .catch(() => {
            meilisearchRunning.value = false
        })
}

testMeilisearch()
</script>

<style scoped>
.status-check {
    padding: 2px 5px;
    border-radius: 2px;
    background-color: #ffdac5;
    color: #b14405;
    margin-bottom: var(--gap-size-2);
}

.status-check a {
    color: var(--clr-gray-800);
}
</style>
