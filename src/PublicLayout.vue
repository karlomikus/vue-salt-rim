<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import BarAssistantClient from '@/api/BarAssistantClient'
import { ref } from 'vue'
import type { components } from '@/api/api'
import BarInfo from '@/components/Public/PublicBarInfo.vue'
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
                    <template v-if="bar">
                        &middot;
                        <RouterLink :to="`/menu/${bar.slug}`">Menu</RouterLink>
                    </template>
                    &middot;
                    <a href="/">Sign In</a>
                </div>
            </div>
        </main>
    </div>
    <div class="public-layout-content">
        <!-- <main>
            <BarShow v-if="bar" :bar="bar" />
        </main> -->
        <main v-if="bar">
            <RouterView :bar="bar" />
        </main>
    </div>
    <div class="public-layout-footer">
        <main>
            Powered by <a href="https://barassistant.app/">Bar Assistant</a>
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
    gap: .5rem;
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
}

.public-layout-footer {
    text-align: center;
}
</style>
