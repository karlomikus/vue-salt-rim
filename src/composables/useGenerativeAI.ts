import { ref } from "vue";
// import { ollama } from 'ai-sdk-ollama';
import {
    createOpenAICompatible,
    OpenAICompatibleChatLanguageModel,
} from "@ai-sdk/openai-compatible";
import { generateObject, type Schema } from "ai";

export const useLLM = () => {
    const response = ref<any>(null);
    const loading = ref(false);
    const error = ref<Error | null>(null);

    const settings = {
        provider: window.srConfig.AI_PROVIDER,
        host: window.srConfig.AI_HOST,
        model: window.srConfig.AI_MODEL,
        apiKey: window.srConfig.AI_API_KEY,
    };

    let model;
    if (settings.provider === "lmstudio") {
        // Special case needed to handle structured outputs
        model = new OpenAICompatibleChatLanguageModel(
            settings.model,
            {
                provider: settings.provider,
                url: ({ path }) => {
                    const url = new URL(`${settings.host}${path}`);
                    return url.toString();
                },
                headers: () => ({}),
                supportsStructuredOutputs: true,
            },
        );
    // } else if (settings.provider === "ollama") {
    //     console.log('Ollama is not yet supported in this version.');
        // model = ollama(settings.model)
    } else {
        model = createOpenAICompatible({
            baseURL: settings.host,
            name: settings.provider,
            apiKey: settings.apiKey,
        }).chatModel(settings.model);
    }

    const generate = async (prompt: string, schema: Schema) => {
        loading.value = true;
        error.value = null;

        try {
            const { object } = await generateObject({
                system: `You are an AI assistant in cocktail recipe application.`,
                model: model,
                prompt: prompt,
                mode: "json",
                schema: schema,
            })
            response.value = object;
        } catch (e) {
            if (e instanceof Error) {
                error.value = e;
            } else {
                error.value = new Error(
                    "An unknown error occurred while generating the response.",
                );
            }
        } finally {
            loading.value = false;
        }
    };

    return {
        response,
        loading,
        error,
        settings,
        generate,
    };
};
