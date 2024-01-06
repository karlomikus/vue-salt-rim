<template>
    <svg class="spinner" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" :width="size" :height="size" :fill="color">
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M18.364 5.636L16.95 7.05A7 7 0 1 0 19 12h2a9 9 0 1 1-2.636-6.364z" />
    </svg>
</template>

<script>
export default {
    props: {
        color: {
            type: String,
            default: '#AF5091'
        },
        size: {
            type: Number,
            default: 32
        }
    }
}
</script>

<style scoped>
.spinner {
    animation-name: rotation;
    animation-duration: .4s;
    animation-iteration-count: infinite;
    transform-origin: 50% 50%;
    animation-timing-function: linear;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
