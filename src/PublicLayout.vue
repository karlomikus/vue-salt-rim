<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import BarAssistantClient from '@/api/BarAssistantClient'
import { ref } from 'vue'
import type { components } from '@/api/api'
import BarInfo from '@/components/Public/BarInfo.vue'

type Bar = components['schemas']['PublicBarResource']

const route = useRoute()
const barId = route.params.barId.toString()
const bar = ref<Bar|null>(null)

const fetchBar = async () => {
    try {
        const resp = (await BarAssistantClient.getPublicBar(parseInt(barId)))?.data
        if (resp) {
            bar.value = resp
        }
    } catch (error) {
        bar.value = null
    }
}

fetchBar()
</script>

<template>
    <div class="public-layout-navigation">
        <main>
            <div class="public-layout-navigation__header">
                <BarInfo v-if="bar" :bar="bar" />
                <div class="public-layout-navigation__links">
                    <RouterLink :to="{ name: 'public.cocktails.index', params: { barId: barId } }">Cocktails</RouterLink>
                    &middot;
                    <a href="#">Menu</a>
                    &middot;
                    <a href="#">Sign up</a>
                </div>
            </div>
        </main>
    </div>
    <div class="public-layout-content">
        <RouterView />
    </div>
    <div class="public-layout-footer">
        <main>
            Powered by Bar Assistant
        </main>
    </div>
</template>

<style>
.public-layout-navigation {
    background-color: var(--clr-gray-900);
    color: #fff;
    padding: 1rem 0;
    margin-bottom: 2rem;
}

.public-layout-navigation__links {
    display: flex;
    gap: 1rem;
}

.public-layout-navigation__links a {
    color: #fff;
}

.public-layout-content {
    margin: 1rem 0;
}

.public-layout-navigation__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
}

.public-layout-footer {
    text-align: center;
}
</style>
