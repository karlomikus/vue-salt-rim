/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'sortablejs'
declare module '@types/slug'

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
        SENTRY_DSN: string,
        REDIRECT_TO_SSO: boolean,
        AI_PROVIDER: string,
        AI_API_KEY: string,
        AI_HOST: string,
        AI_MODEL: string,
    }
}
