<template>
    <PageHeader>
        {{ $t('ai.assistant') }}
    </PageHeader>
    <div class="assistant">
        <div class="assistant-settings">
            <AssistantSettings v-model="configuration"></AssistantSettings>
            <button type="button" class="button button--outline" @click="refreshVectorDB">Refresh db</button>
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
import PageHeader from "../PageHeader.vue";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RunnableSequence, RunnablePassthrough } from "langchain/schema/runnable";
import { formatDocumentsAsString } from "langchain/util/document";
import { PromptTemplate } from "langchain/prompts";
import { StringOutputParser } from "langchain/schema/output_parser";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import ChatBubble from "./ChatBubble.vue";
import AssistantSettings from "./AssistantSettings.vue";

export default {
    components: {
        PageHeader,
        ChatBubble,
        AssistantSettings,
    },
    data() {
        return {
            embeddings: null,
            model: null,
            vectorStore: null,
            memory: null,
            favorites: [],
            result: '',
            userPrompt: '',
            collectionName: 'bass-7',
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

        this.model = new ChatOpenAI({
            modelName: this.configuration.openAi.modelName,
            openAIApiKey: this.configuration.openAi.key,
            streaming: true,
            // maxTokens: 2048,
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
                name: 'YOU',
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

            const questionPrompt = PromptTemplate.fromTemplate(`You are a bartender working in a cocktail bar called "Sekira" serving guests. Use the following information as help when answering the question.
----------
GUEST FAVORITES: ${this.favoriteCocktailNames}
---------
CONTEXT: {context}
----------
CHAT HISTORY: {chatHistory}
----------
QUESTION: {question}
----------
Answer:`
            );

            const retriever = this.vectorStore.asRetriever();

            const chain = RunnableSequence.from([
                {
                    context: retriever.pipe(formatDocumentsAsString),
                    chatHistory: () => this.messages.map(m => `${m.name}: ${m.content}`).join("\n"),
                    question: new RunnablePassthrough(),
                },
                questionPrompt,
                this.model,
                new StringOutputParser(),
            ]);

            this.getMessageById(id).isStreaming = true
            const stream = await chain.stream(userPrompt);

            for await (const chunk of stream) {
                this.getMessageById(id).content += chunk
            }

            this.getMessageById(id).isStreaming = false
            this.getMessageById(id).documents = await retriever.getRelevantDocuments(this.getMessageById(id).content)
        },
        getMessageById(id) {
            return this.messages.find(m => m.id == id);
        },
        async refreshVectorDB() {
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
ABV: ${cocktail.abv}
Ingredients: ${cocktail.ingredients.map(i => i.name).join(', ')}
Tags: ${cocktail.tags.map(t => t.name).join(', ')}`], [
                    { slug: cocktail.slug, type: 'cocktail', name: cocktail.name }
                ]))
            }

            for (let i = 0; i < ingredients.data.length; i++) {
                const ingredient = ingredients.data[i];

                documents = documents.concat(await splitter.createDocuments([`Ingredient info:
Name: ${ingredient.name}
Description: ${ingredient.description}`], [
                    { slug: ingredient.slug, type: 'ingredient', name: ingredient.name }
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
