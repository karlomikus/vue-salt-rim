<template>
    <div class="cocktail-list-container">
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
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const imgElement = entry.target.querySelector('.cocktail-list-item__graphic__image');
                    imgElement.style.backgroundImage = `url('${imgElement.dataset.imgSrc}')`
                    this.observer.unobserve(entry.target)
                }
            });
        });
    }
}
</script>

<style scoped>
.cocktail-list-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--cocktail-list-card-width), 1fr));
    gap: 10px;
}

@media (max-width: 450px) {
    .cocktail-list-container {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
}
</style>
