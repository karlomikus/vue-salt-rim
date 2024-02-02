<script setup>
const model = defineModel()
</script>

<template>
    <div class="block-container block-container--padded">
        <div class="form-group">
            <label class="form-label form-label--required" for="apikey">{{ $t('ai.api_key') }}:</label>
            <input id="apikey" class="form-input" type="text" required v-model="model.openAi.key">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="llm-url">{{ $t('ai.api_url') }}:</label>
            <input id="llm-url" class="form-input" type="text" required v-model="model.openAi.url">
        </div>
        <div class="form-group">
            <label class="form-label form-label--required" for="model-name">{{ $t('ai.model') }}:</label>
            <input id="model-name" class="form-input" type="text" required v-model="model.openAi.modelName">
        </div>
    </div>
</template>
