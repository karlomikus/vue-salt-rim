import { useToast } from 'vue-toast-notification'

export function useSaltRimToast() {
    return useToast({
        position: 'top',
        type: 'default',
        duration: 1500,
        pauseOnHover: true,
    })
}