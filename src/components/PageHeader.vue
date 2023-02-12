<template>
    <header class="site-page-header">
        <div class="site-page-header__title">
            <h2><slot /></h2>
        </div>
        <div class="site-page-header__actions">
            <slot name="actions" />
        </div>
    </header>
</template>

<style scoped>
.site-page-header {
    display: flex;
    border-bottom: 3px solid var(--clr-red-300);
    padding-bottom: 20px;
    margin-bottom: 20px;
    align-items: center;
}

.site-page-header__title h2 {
    /* font-family: var(--font-accent); */
    font-weight: bold;
}

.site-page-header__actions {
    margin-left: auto;
    display: flex;
    gap: 1rem;
}
</style>
