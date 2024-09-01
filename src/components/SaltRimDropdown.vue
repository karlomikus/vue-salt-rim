<script setup lang="ts">
import {ref} from 'vue'
import { onClickOutside } from '@vueuse/core'
import {useFloating, offset, flip, shift, autoUpdate} from '@floating-ui/vue'

const isShown = ref(false)
const reference = ref(null)
const content = ref(null)

const toggleDropdown = function () {
    isShown.value = !isShown.value
}

const { floatingStyles } = useFloating(reference, content, {
    placement: 'bottom-end',
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
})

onClickOutside(reference, () => {
    isShown.value = false
})
</script>

<template>
    <div class="dropdown-wrapper">
        <div ref="reference">
            <slot :toggle-dropdown="toggleDropdown" />
        </div>
        <div v-show="isShown" ref="content" class="floating-element" :style="floatingStyles">
            <div class="dropdown-menu">
                <slot name="content" />
            </div>
        </div>
    </div>
</template>
