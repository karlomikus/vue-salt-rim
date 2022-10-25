<template>
    <div class="ingredient-list-item">
        <div class="ingredient-list-item__image">
            <img :src="ingredient.image_url" alt="">
        </div>
        <div class="ingredient-list-item__content">
            <h3>{{ ingredient.name }}</h3>
            <p>{{ ingredient.description }}</p>
            <a href="#">Add to my shelf</a> &middot;
            <a href="#">Remove from list</a>
            <!-- <RouterLink :to="{ name: 'ingredients.show', params: { id: ingredient.slug } }">More</RouterLink> -->
        </div>
    </div>
</template>

<script>
export default {
    props: ['ingredient']
}
</script>
<style scoped>
.ingredient-list-item {
    display: flex;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 3px 0 var(--color-bg-dark);
    transition: box-shadow ease-in-out 150ms;
    text-decoration: none;
}

.ingredient-list-item__image {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.ingredient-list-item img {
    height: 50px;
}

.ingredient-list-item__content h3 {
    font-size: 1.2rem;
    font-family: var(--font-accent);
    font-weight: 700;
}

.ingredient-list-item__content p {
    color: var(--color-text-muted);
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
