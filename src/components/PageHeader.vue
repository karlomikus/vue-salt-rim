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
    --sph-clr-border: var(--clr-accent-200);
    display: flex;
    flex-wrap: wrap;
    border-bottom: 2px solid var(--sph-clr-border);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
    align-items: center;
}

.dark-theme .site-page-header {
    --sph-clr-border: var(--clr-dark-main-800)
}

.site-page-header__title h2 {
    /* font-family: var(--font-accent); */
    font-weight: var(--fw-bold);
}

.site-page-header__actions {
    margin-left: auto;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-3);
}

@media (max-width: 450px) {
    .site-page-header__actions {
        gap: var(--gap-size-2);
    }
}

.site-page-header :deep(p) {
    font-size: 1rem;
    color: var(--clr-dark-main-500);
}
</style>
