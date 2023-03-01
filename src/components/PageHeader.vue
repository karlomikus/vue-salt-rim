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
    flex-wrap: wrap;
    border-bottom: 3px solid var(--clr-red-200);
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
    flex-wrap: wrap;
    gap: 1rem;
}

@media (max-width: 450px) {
    .site-page-header__actions {
        gap: 0.5rem;
    }
}
</style>
