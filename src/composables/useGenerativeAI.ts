import { Ollama } from 'ollama/browser'
import { ref } from 'vue'

interface LLMProvider {
    generate(prompt: string, format?: string | object): Promise<string>
}

class OllamaProvider implements LLMProvider {
    private ollama: Ollama
    private model: string

    constructor(host: string, model: string) {
        this.ollama = new Ollama({ host })
        this.model = model
    }

    async generate(prompt: string, format: string | object = 'json'): Promise<string> {
        const result = await this.ollama.generate({
            model: this.model,
            prompt: prompt,
            stream: false,
            format: format,
            options: {
                temperature: 0.1,
            },
        })
        return result.response
    }
}

export const useLLM = () => {
    const response = ref('')
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const settings = {
        provider: window.srConfig.AI_PROVIDER,
        host: window.srConfig.AI_HOST,
        model: window.srConfig.AI_MODEL,
        apiKey: window.srConfig.AI_API_KEY,
    }

    const createProvider = (): LLMProvider => {
        switch (settings.provider.toLowerCase()) {
            case 'ollama':
                return new OllamaProvider(settings.host, settings.model)
            default:
                throw new Error(`Unsupported LLM provider: ${settings.provider}`)
        }
    }

    const provider = createProvider()

    const generate = async (prompt: string, format: string | object = 'json') => {
        loading.value = true
        error.value = null
        response.value = ''

        try {
            response.value = await provider.generate(prompt, format)
        } catch (e) {
            if (e instanceof Error) {
                error.value = e
            } else {
                error.value = new Error('An unknown error occurred while generating the response.')
            }
        } finally {
            loading.value = false
        }
    }

    return {
        response,
        loading,
        error,
        settings,
        generate,
    }
}
