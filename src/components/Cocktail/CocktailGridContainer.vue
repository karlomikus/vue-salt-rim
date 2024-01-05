<template>
    <div class="cocktail-grid-container">
        <slot :observer="observer" />
    </div>
</template>

<script>
export default {
    data() {
        return {
            observer: null,
        }
    },
    created() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target.querySelector('.cocktail-grid-item__graphic__image')
                    imgElement.src = imgElement.dataset.imgSrc
                    this.observer.unobserve(entry.target)
                }
            })
        })
    }
}
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
