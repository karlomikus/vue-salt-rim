import { Ollama } from 'ollama/browser'
import { ref } from 'vue'

export const useLLM = () => {
    const response = ref('')
    const loading = ref(false)
    const error = ref<Error | null>(null)

    const settings = {
        host: window.srConfig.OLLAMA_HOST,
        model: window.srConfig.OLLAMA_MODEL,
    }

    const ollama = new Ollama({ host: settings.host })

    const generate = async (prompt: string, format: string | object = 'json') => {
        loading.value = true
        error.value = null
        response.value = ''

        try {
            const result = await ollama.generate({
                model: settings.model,
                prompt: prompt,
                stream: false,
                format: format,
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
