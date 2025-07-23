<template>
    <div class="gen-loader"></div>
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

.gen-loader {
    --ol-clr-bg: rgba(255, 223, 164, 0.7);
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
    opacity: .5;
    filter: blur(10px);
}

.gen-loader:after {
    content: "";
    animation: p-skeleton-animation 0.7s infinite;
    height: 100%;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 1;
    background: linear-gradient(90deg,rgba(255, 166, 255, 0),rgba(255, 166, 255, 0.7),rgba(166, 222, 255, 0.7),rgba(255, 166, 255, 0));
}

.dark-theme .gen-loader {
    --ol-clr-bg: rgba(43, 50, 116, 0.7);
}
</style>
