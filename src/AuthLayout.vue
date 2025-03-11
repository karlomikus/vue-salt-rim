<script setup lang="ts">
import { RouterView } from 'vue-router'
import SiteHeader from './components/Layout/SiteHeader.vue'
import SiteFooter from './components/Layout/SiteFooter.vue'
</script>

<template>
    <SiteHeader />
    <RouterView />
    <SiteFooter />
</template>
