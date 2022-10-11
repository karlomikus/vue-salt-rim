<script setup>
import { RouterLink, RouterView } from 'vue-router'
import Header from './components/Header.vue'
</script>

<template>
  <Header />
  <RouterView />
  <div style="background: #fff; margin: 40px 0 0 0; padding: 40px 0;">
    <a href="#">Github bar assistant</a>
    <a href="#">Github vue frontend</a>
    icons by https://remixicon.com/
  </div>
</template>
