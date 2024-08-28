/// <reference types="vite/client" />

interface Window {
    srConfig: {
        VERSION: string,
        API_URL: string,
        MEILISEARCH_URL: string,
        DEFAULT_LOCALE: string,
        ENV: string,
        MAILS_ENABLED: boolean,
        BILLING_TOKEN: string,
        BILLING_ENABLED: boolean,
        BILLING_ENV: string,
        ANALYTICS_HOST: string,
        ALLOW_REGISTRATION: string,
    }
}
