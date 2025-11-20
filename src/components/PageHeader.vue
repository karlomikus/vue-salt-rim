<template>
    <header class="site-page-header">
        <div class="site-page-header__title">
            <h2><slot /></h2>
        </div>
        <div v-if="$slots.actions" class="site-page-header__actions">
            <slot name="actions" />
        </div>
    </header>
</template>

<style scoped>
.site-page-header {
    --sph-clr-border: var(--clr-accent-200);
    display: flex;
    flex-wrap: wrap;
    /* border-bottom: 3px double var(--sph-clr-border); */
    padding-bottom: 1rem;
    /* margin-bottom: 1rem; */
    align-items: center;
}

.dark-theme .site-page-header {
    --sph-clr-border: var(--clr-dark-main-800)
}

.site-page-header__title h2 {
    font-family: var(--font-heading);
    font-weight: var(--fw-bold);
    font-size: 2em;
    line-height: 1.4;
}

:deep(.site-page-header__title small) {
    font-family: var(--font-primary);
    font-size: 0.5em;
    color: var(--clr-gray-700);
    display: block;
}

.site-page-header__actions {
    margin-left: auto;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-3);
}

@media (max-width: 450px) {
    .site-page-header {
        flex-direction: column;
        gap: var(--gap-size-2);
    }

    .site-page-header__actions {
        margin-left: 0;
        gap: var(--gap-size-2);
    }

    .site-page-header__title h2 {
        text-align: center;
    }
}

.site-page-header :deep(p) {
    font-size: 1rem;
    color: var(--clr-dark-main-500);
}
</style>
