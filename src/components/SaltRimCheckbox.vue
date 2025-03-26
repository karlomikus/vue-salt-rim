<script setup>
defineProps({
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: null
    }
})

defineOptions({
    inheritAttrs: false
})

const model = defineModel({ required: true, type: null })
</script>

<template>
    <div class="sr-checkbox">
        <div class="sr-checkbox__input">
            <input :id="$attrs.id" v-model="model" type="checkbox">
        </div>
        <div class="sr-checkbox__text">
            <label :for="$attrs.id">{{ label }}</label>
            <p class="form-input-hint">{{ description }}</p>
        </div>
    </div>
</template>

<style scoped>
.sr-checkbox {
    display: flex;
}
.sr-checkbox__input {
    line-height: 2;
}
.sr-checkbox__input input {
    min-width: 20px;
    min-height: 20px;
}
.sr-checkbox__text {
    margin-left: var(--gap-size-2);
}
.sr-checkbox__text label {
    font-weight: bold;
}
.sr-checkbox__text p {
    font-size: 0.8rem;
}
</style>