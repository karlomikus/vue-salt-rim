<script setup lang="ts">
import { RouterView } from "vue-router";
import { useRoute } from "vue-router";
import BarShow from "@/components/Public/PublicBarShow.vue";

const route = useRoute();
const barId = route.params.barId?.toString();
</script>

<template>
    <div class="public-layout-content">
        <main>
            <template v-if="barId">
                <BarShow :barId="barId" />
            </template>
            <RouterView />
        </main>
    </div>
    <div class="public-layout-footer">
        <main>Powered by <a href="https://barassistant.app/">Bar Assistant</a></main>
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
