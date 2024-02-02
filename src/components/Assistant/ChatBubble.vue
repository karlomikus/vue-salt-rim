<script setup>
import { micromark } from 'micromark'

defineProps({
    message: {
        type: Object,
        default() {
            return {}
        },
        required: true
    },
})

const parseContent = (content) => {
    if (!content) {
        return null
    }

    return micromark(content)
}
</script>

<template>
    <div class="chat-bubble">
        <div class="chat-bubble__avatar">{{ message.name }}</div>
        <div class="block-container chat-bubble__content">
            <div class="chat-bubble__content__message" v-html="parseContent(message.content)"></div>
            <ul v-if="message.documents.length > 0" class="chat-bubble__content__meta">
                <li v-for="doc in message.documents">
                    <RouterLink class="chat-link chat-link--cocktail" v-if="doc.metadata.type == 'cocktail'" :to="{ name: 'cocktails.show', params: { id: doc.metadata.slug } }">{{ doc.metadata.name }}</RouterLink>
                    <RouterLink class="chat-link chat-link--ingredient" v-if="doc.metadata.type == 'ingredient'" :to="{ name: 'ingredients.show', params: { id: doc.metadata.slug } }">{{ doc.metadata.name }}</RouterLink>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.chat-bubble {
    display: flex;
    flex-direction: row;
    gap: var(--gap-size-2);
}

.chat-bubble__avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-2);
    display: flex;
    align-items: center;
    justify-content: center;
    background: #821e31;
    color: #fff;
    font-size: 0.75rem;
    flex-shrink: 0;
    font-weight: var(--fw-bold);
}

.chat-bubble__content {
    /* background-color: var(--clr-gray-100); */
    width: 100%;
    padding: var(--gap-size-2);
    /* border-radius: var(--radius-2); */
}

.chat-bubble__content__meta {
    list-style: none;
    margin: 0.5rem 0 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: var(--gap-size-2);
}

.chat-link {
    display: block;
    font-size: 0.75rem;
    padding: 1px 3px;
    border: 1px solid var(--clr-gray-800);
    color: var(--clr-gray-800);
    background-color: var(--clr-gray-100);
    border-radius: 3px;
    text-decoration: none;
}

.chat-link.chat-link--cocktail {
    border: 1px solid #821e31;
    color: #821e31;
    background-color: #fae2e6;
}

.chat-link.chat-link--ingredient {
    border: 1px solid #1e5582;
    color: #1e5582;
    background-color: #e2effa;
}
</style>
