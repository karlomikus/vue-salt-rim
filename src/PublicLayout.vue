<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import BarAssistantClient from '@/api/BarAssistantClient'
import { ref } from 'vue'
import type { components } from '@/api/api'
import BarShow from '@/components/Public/PublicBarShow.vue'

type Bar = components['schemas']['PublicBarResource']

const route = useRoute()
const barId = route.params.barId.toString()
const bar = ref<Bar|null>(null)

const fetchBar = async () => {
    try {
        const resp = (await BarAssistantClient.getPublicBar(barId))?.data
        if (resp) {
            bar.value = resp
        }
    } catch (error) {
        window.location.href = '/'
    }
}

fetchBar()
</script>

<template>
    <div class="public-layout-content">
        <main v-if="bar">
            <BarShow :bar="bar" />
            <RouterView :bar="bar" />
        </main>
    </div>
    <div class="public-layout-footer">
        <main>
            Powered by <a href="https://barassistant.app/">Bar Assistant</a>
        </main>
    </div>
</template>

<style scoped>
.public-layout-content {
    margin: 1rem 0;
}

.public-layout-content main {
    max-width: 800px;
}

.public-layout-navigation__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.public-layout-footer {
    text-align: center;
    padding: 1rem 0 3rem 0;
}
</style>
