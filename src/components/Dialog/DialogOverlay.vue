<template>
    <div class="dialog-overlay">
        <div class="dialog-container">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.dialog-overlay {
    background-color: rgba(21, 13, 34, 0.6);
    position: fixed;
    inset: 0;
    z-index: 1000;
}

.dialog-container {
    overflow-x: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    padding: 1rem;
}
</style>
