<template>
    <RouterLink class="cocktail-list-item" :to="{ name: 'cocktails.show', params: { id: cocktail.slug } }">
        <div class="cocktail-list-item__graphic">
            <div class="cocktail-list-item__graphic__image" :data-img-src="cocktail.image_url"></div>
        </div>
        <div class="cocktail-list-item__content">
            <h3>{{ cocktail.name }}</h3>
            <p v-if="cocktail.short_ingredients">
                {{ cocktail.short_ingredients.join(', ') }}
            </p>
        </div>
    </RouterLink>
</template>

<script>
export default {
    props: ['cocktail', 'observer'],
    mounted() {
        this.observer.observer.observe(this.$el)
    }
}
</script>
<style scoped>
.cocktail-list-item {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 3px 0 var(--color-bg-dark);
    transition: box-shadow ease-in-out 150ms;
    text-decoration: none;
}

.cocktail-list-item:hover {
  box-shadow: 0 3px 0 #aa5076;
}

.cocktail-list-item__graphic__image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #fff;
    background-size: cover;
    background-position: center center;
    flex-shrink: 0;
    margin-right: 20px;
}

.cocktail-list-item__content h3 {
    font-size: 1.2rem;
    font-family: var(--font-accent);
    font-weight: 700;
}

.cocktail-list-item__content p {
    color: var(--color-text-muted);
}

@media (max-width: 450px) {
    .cocktail-list-item {
        padding: 15px;
    }

    .cocktail-list-item__graphic__image {
        width: 70px;
        height: 70px;
        margin-right: 10px;
    }
}
</style>
