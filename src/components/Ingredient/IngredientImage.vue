<template>
    <div class="ingredient__image" :style="{ 'background-color': backgroundColor }">
        <img :src="mainIngredientImageUrl" :alt="ingredient.name">
    </div>
</template>
<script>
export default {
    props: {
        ingredient: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    computed: {
        backgroundColor() {
            const hex = this.ingredient.color || '#51274c'

            let c
            if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
                c = hex.substring(1).split('')
                if (c.length == 3) {
                    c = [c[0], c[0], c[1], c[1], c[2], c[2]]
                }
                c = '0x' + c.join('')
                return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',.13)'
            }

            return hex
        },
        mainIngredientImageUrl() {
            if (!this.ingredient.main_image_id && !this.ingredient.image_url) {
                return '/no-ingredient.png'
            }

            if (this.ingredient.image_url) {
                return this.ingredient.image_url
            }

            return this.ingredient.images.filter((img) => img.id == this.ingredient.main_image_id)[0].url
        }
    }
}
</script>
<style scoped>
.ingredient__image {
    width: 70px;
    height: 70px;
    border-radius: var(--radius-1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: hidden;
    background-color: #fff;
}

.ingredient__image img {
    height: 100px;
    position: absolute;
    top: 10px;
    transition: top ease-in-out .2s;
}

.ingredient__image.ingredient__image--small {
    width: 45px;
    height: 45px;
}

.ingredient__image.ingredient__image--small img {
    height: 70px;
}

.ingredient__image:hover img {
    top: -15px;
}
</style>
