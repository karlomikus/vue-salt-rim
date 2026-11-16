<script setup lang="ts">
import { RouterView } from "vue-router";
import SiteHeader from "./components/Layout/SiteHeader.vue";
import SiteFooter from "./components/Layout/SiteFooter.vue";
import MobileBottomNav from "./components/Layout/MobileBottomNav.vue";
</script>

<template>
    <SiteHeader />
    <RouterView />
    <SiteFooter />
    <MobileBottomNav />
</template>
