<script setup lang="ts">
import type { components } from '@/api/api'
import { thumbHashToDataURL } from 'thumbhash'
import { computed } from 'vue';

type Image = components['schemas']['Image']

const props = defineProps<{
    image: Image|null
}>()

const imageUrl = computed(() => {
    if (!props.image) {
        return '/no-cocktail.jpg'
    }

    return props.image.thumb_url
})

const placeholderImage = computed(() => {
    if (props.image?.placeholder_hash) {
        return thumbHashToDataURL(
            Uint8Array.from(atob(props.image.placeholder_hash), c => c.charCodeAt(0))
        )
    }

    return ''
})

const placeholderImageStyles = {
    backgroundImage: `url(${placeholderImage.value})`,
}
</script>

<template>
    <div class="salt-rim-image-thumb" :style="placeholderImageStyles">
        <img :src="imageUrl" :alt="image?.copyright ?? undefined" :title="image?.copyright ?? undefined" />
    </div>
</template>

<style scoped>
.salt-rim-image-thumb {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-1);
    overflow: hidden;
    flex-shrink: 0;
    background-size: cover;
    background-repeat: no-repeat;
    font-size: 0;
}

.salt-rim-image-thumb img {
    height: 100%;
    width: 100%;
    object-fit: cover;
}
</style>
