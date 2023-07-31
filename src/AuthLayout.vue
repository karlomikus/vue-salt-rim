<script setup>
import { RouterView } from 'vue-router'
import SiteHeader from './components/Layout/SiteHeader.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <SiteHeader />
  <RouterView />
  <Footer />
</template>
