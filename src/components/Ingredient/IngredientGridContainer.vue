<template>
    <div class="ingredient-grid-container">
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
    // created() {
    //     this.observer = new IntersectionObserver((entries, observer) => {
    //         entries.forEach((entry) => {
    //             if (entry.isIntersecting) {
    //                 const imgElement = entry.target.querySelector('.cocktail-grid-item__graphic img');
    //                 imgElement.src = imgElement.dataset.imgSrc
    //                 this.observer.unobserve(entry.target)
    //             }
    //         });
    //     });
    // }
}
</script>

<style scoped>
.ingredient-grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 10px;
}
</style>
