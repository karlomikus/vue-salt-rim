import { Ollama } from 'ollama'
import { ref } from 'vue'

export const ingredientStructuredOutput = {
    type: 'object',
    properties: {
        description: {
            type: 'string',
        },
        color: {
            type: 'string',
        },
        origin: {
            type: 'string',
        },
        strength: {
            type: 'number',
        },
    },
    required: ['description', 'color', 'origin', 'strength'],
}

export const useLLM = () => {
    const response = ref('')
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const settings = {
        host: window.srConfig.OLLAMA_HOST,
        model: window.srConfig.OLLAMA_MODEL,
    }

    const ollama = new Ollama({ host: settings.host })

    const generate = async (prompt: string) => {
        loading.value = true
        error.value = null
        response.value = ''

        try {
            // Make sure your Ollama server is running.
            const result = await ollama.generate({
                model: settings.model,
                prompt: prompt,
                stream: false,
                format: ingredientStructuredOutput,
                options: {
                    temperature: 0.1,
                },
            })
            response.value = result.response
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
