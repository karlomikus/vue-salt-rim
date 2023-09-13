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
    display: grid;
    /* grid-template-columns: repeat(auto-fit, minmax(var(--cocktail-grid-card-width), 1fr)); */
    grid-template-columns: repeat(auto-fill, minmax(max(var(--cocktail-grid-card-width), var(--cocktail-grid-card-width)), 1fr));
    gap: var(--gap-size-5);
    margin-top: 2rem;
}
</style>
