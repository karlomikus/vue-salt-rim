<template>
    <div class="assistant">
        <div class="assistant-settings">
            <AssistantSettings v-model="configuration"></AssistantSettings>
            <button type="button" class="button button--outline" @click="refresh">Refresh db</button>
        </div>
        <div class="assistant-chat">
            <p>{{ result }}</p>
            <div class="chat-messages">
                <ChatBubble v-for="message in messages" :message="message"></ChatBubble>
            </div>
            <div class="chat-prompt">
                <textarea class="form-input" row="4" v-model="userPrompt" @keyup.enter="run" placeholder="Ask your personal bartender..."></textarea>
                <button type="button" class="button button--dark" @click.prevent="run">Send</button>
            </div>
        </div>
    </div>
</template>

<script>
import ApiRequests from "../../ApiRequests";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RunnableSequence, RunnablePassthrough } from "langchain/schema/runnable";
import { formatDocumentsAsString } from "langchain/util/document";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { OpenAIEmbeddings } from "@langchain/openai";
import ChatBubble from "./ChatBubble.vue";
import AssistantSettings from "./AssistantSettings.vue";

export default {
    components: {
        ChatBubble,
        AssistantSettings,
    },
    data() {
        return {
            embeddings: null,
            model: null,
            vectorStore: null,
            favorites: [],
            result: '',
            userPrompt: '',
            collectionName: 'bass-6',
            configuration: {
                openAi: {
                    key: '',
                    url: 'http://192.168.50.100:1234/v1',
                    modelName: 'gpt-3.5-turbo',
                },
                vectorStore: {
                    url: 'http://localhost:8086',
                },
            },
            messages: []
        }
    },
    async created() {
        this.embeddings = new OpenAIEmbeddings({
            openAIApiKey: this.configuration.openAi.key,
            modelName: "text-embedding-3-small",
        });

        this.model = new OpenAI({
            modelName: this.configuration.openAi.modelName,
            openAIApiKey: this.configuration.openAi.key,
            maxTokens: 2048,
            // configuration: {
            //     baseURL: this.configuration.openAi.url,
            // },
        });

        this.vectorStore = new Chroma(this.embeddings, {
            collectionName: this.collectionName,
            url: this.configuration.vectorStore.url
        });

        this.favorites = (await ApiRequests.fetchCocktails({ 'filter[favorites]': true, per_page: 300 })).data;
    },
    computed: {
        favoriteCocktailNames() {
            return this.favorites.map(c => c.name).join(',');
        }
    },
    methods: {
        run() {
            this.messages.push({
                id: crypto.randomUUID(),
                name: 'USER',
                content: this.userPrompt,
                documents: [],
                isStreaming: false,
            })

            this.runPrompt(this.userPrompt)

            this.userPrompt = ''
        },
        async runPrompt(userPrompt) {
            const id = crypto.randomUUID();
            this.messages.push({
                id: id,
                name: 'AI',
                content: '',
                documents: [],
                isStreaming: false,
            })

            const template = `You are a bartender working in a cocktail bar called "Sekira". Use the following context as help when answering the question.
<context>
Guest's favorite cocktails:
${this.favoriteCocktailNames}
Related:
{filtered_context}
</context>
Question: {question}
Answer:`;
            const formatted_prompt = new PromptTemplate({
                inputVariables: ["filtered_context", "question"],
                template,
            });

            const retriever = this.vectorStore.asRetriever();

            const chain = RunnableSequence.from([
                {
                    filtered_context: retriever.pipe(formatDocumentsAsString),
                    question: new RunnablePassthrough(),
                },
                formatted_prompt,
                this.model,
                new StringOutputParser(),
            ]);

            this.getMessageById(id).isStreaming = true
            const stream = await chain.stream(userPrompt);

            for await (const chunk of stream) {
                this.getMessageById(id).content += chunk
            }

            console.log('Done streaming')
            this.getMessageById(id).isStreaming = false
            this.getMessageById(id).documents = await retriever.getRelevantDocuments(this.getMessageById(id).content)
        },
        getMessageById(id) {
            return this.messages.find(m => m.id == id);
        },
        async refresh() {
            const cocktails = await ApiRequests.fetchCocktails({ 'filter[on_shelf]': true, per_page: 300 });
            const ingredients = await ApiRequests.fetchIngredients({ 'filter[on_shelf]': true, per_page: 500 });

            let documents = [];
            const splitter = new RecursiveCharacterTextSplitter({
                chunkSize: 1024,
                chunkOverlap: 50,
            });

            for (let i = 0; i < cocktails.data.length; i++) {
                const cocktail = cocktails.data[i];

                documents = documents.concat(await splitter.createDocuments([`Cocktail info:
Name: ${cocktail.name}
Ingredients: ${cocktail.ingredients.map(i => i.name).join(', ')}
Tags: ${cocktail.tags.map(t => t.name).join(', ')}`], [
                    {slug: cocktail.slug, type: 'cocktail', name: cocktail.name}
                ]))
            }

            for (let i = 0; i < ingredients.data.length; i++) {
                const ingredient = ingredients.data[i];

                documents = documents.concat(await splitter.createDocuments([`Ingredient info:
Name: ${ingredient.name}
Description: ${ingredient.description}`], [
                    {slug: ingredient.slug, type: 'ingredient', name: ingredient.name}
                ]))
            }

            await this.vectorStore.addDocuments(documents)
        }
    }
}
</script>

<style scoped>
.assistant {
    display: grid;
    grid-template-columns: 1fr 3fr;
    gap: var(--gap-size-2);
}

.chat-messages {
    display: flex;
    flex-direction: column;
    gap: var(--gap-size-2);
}

.chat-prompt {
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    gap: var(--gap-size-2);
}

.chat-prompt .form-input {
    width: 100%;
}
</style>
