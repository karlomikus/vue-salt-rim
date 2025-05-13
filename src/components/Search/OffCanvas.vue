<template>
    <div class="offcanvas">
        <div class="offcanvas__header">
            <h2>{{ $t('filters') }}</h2>
        </div>
        <div class="offcanvas__content">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.offcanvas {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    max-width: 100%;
    height: 100%;
    background-color: var(--clr-accent-50);
    z-index: 5;
    display: flex;
    flex-direction: column;
    /* transform: translateX(-100%);
    transition: transform 0.1s ease-in-out; */
}

.offcanvas.offcanvas--open {
    transform: none;
}

.offcanvas__content {
    padding: 1rem;
    flex-grow: 1;
    overflow-y: auto;
}
</style>