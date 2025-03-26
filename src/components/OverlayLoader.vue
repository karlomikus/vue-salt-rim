<template>
    <div class="overlay-loader"></div>
</template>

<style scoped>
@keyframes p-skeleton-animation {
    from {
        transform: translateX(-100%);
    }
    to {
        transform: translateX(100%);
    }
}

.overlay-loader {
    --ol-clr-bg: rgba(231, 222, 231, 0.7);
    position: absolute;
    overflow: hidden;
    top: 0;
    left: 0;
    display: flex;
    background: var(--ol-clr-bg);
    width: 100%;
    height: 100%;
    justify-content: center;
    z-index: var(--z-overlay-loader);
    backdrop-filter: blur(1px);
}

.overlay-loader:after {
    content: "";
    animation: p-skeleton-animation 0.7s infinite;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 1;
    background: linear-gradient(90deg,rgba(243, 236, 243,0),rgba(243, 236, 243,0.7),rgba(243, 236, 243,0));
}

.dark-theme .overlay-loader {
    --ol-clr-bg: rgba(30, 23, 36, 0.7);
}

.dark-theme .overlay-loader:after {
    background: linear-gradient(90deg,rgba(30, 23, 36, 0),rgba(94, 89, 99, 0.9),rgba(30, 23, 36, 0));
}
</style>
