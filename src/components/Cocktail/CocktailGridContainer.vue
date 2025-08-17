<template>
    <div class="cocktail-grid-container">
        <slot :observer="observer" />
    </div>
</template>

<script setup lang="ts">
const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
            const imgElement = entry.target.querySelector('.cocktail-grid-item__graphic__image') as HTMLImageElement
            if (imgElement && imgElement.dataset.imgSrc) {
                imgElement.src = imgElement.dataset.imgSrc
                observer.unobserve(entry.target)
            }
        }
    })
})
</script>

<style scoped>
.cocktail-grid-container {
    --cocktail-grid-card-width: 250px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(max(var(--cocktail-grid-card-width), var(--cocktail-grid-card-width)), 1fr));
    gap: var(--gap-size-5);
    margin-top: 2rem;
}

@media (max-width: 545px) {
    .cocktail-grid-container {
        --cocktail-grid-card-width: 140px;
        gap: var(--gap-size-2);
    }
}
</style>
