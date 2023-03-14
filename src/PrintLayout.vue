<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div>
    <RouterView />
    <div class="no-print" style="text-align: center;">
      <button type="button" class="button button--dark" @click="print">Print</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    print() {
      window.print();
    }
  }
}
</script>
