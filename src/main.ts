import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import ToastPlugin from 'vue-toast-notification'
// @ts-ignore
import InstantSearch from 'vue-instantsearch/vue3/es'
import router from './router'
import dialog from './components/Dialog/plugin'
import './assets/main.css'
import AppState from './AppState'
import Plausible from 'plausible-tracker'
import { registerSW } from 'virtual:pwa-register'
import { register as registerSwiperElements } from 'swiper/element/bundle'
import * as Sentry from "@sentry/vue";

import en_US from './locales/en-US'
import hr_HR from './locales/hr-HR'
import fr_FR from './locales/fr-FR'
import de_DE from './locales/de-DE'
import pl_PL from './locales/pl-PL'
import it_IT from './locales/it-IT'
import sv_SE from './locales/sv-SE'
import zh_CN from './locales/zh-CN'
import nl_NL from './locales/nl-NL'
import cs_CZ from './locales/cs-CZ'
import fi_FI from './locales/fi-FI'

registerSW({ immediate: true })
registerSwiperElements()

if (window.srConfig.ANALYTICS_HOST && window.srConfig.ANALYTICS_HOST != '') {
    const { enableAutoPageviews, enableAutoOutboundTracking } = Plausible({
        apiHost: window.srConfig.ANALYTICS_HOST
    })

    enableAutoPageviews()
    enableAutoOutboundTracking()
}

const appState = new AppState()

let userSelectedLocale = appState.language
if (!userSelectedLocale) {
    userSelectedLocale = window.srConfig.DEFAULT_LOCALE || 'en-US'
}

const userSelectedTheme = appState.theme
if (userSelectedTheme == 'dark' && !document.body.classList.contains('dark-theme')) {
    document.body.classList.add('dark-theme')
    const metaColor = document.querySelector('meta[name="theme-color"]')
    if (metaColor) {
        metaColor.setAttribute('content', '#282238')
    }
}

const app = createApp(App)

if (window.srConfig.SENTRY_DSN && window.srConfig.SENTRY_DSN != '') {
    Sentry.init({
        app,
        release: window.srConfig.VERSION,
        dsn: window.srConfig.SENTRY_DSN,
        integrations: [],
    });
}

// @ts-ignore
const i18n = createI18n({
    legacy: false,
    locale: userSelectedLocale,
    fallbackLocale: 'en-US',
    numberFormats: {
        'en-US': en_US.numbers,
        'hr-HR': hr_HR.numbers,
        'fr-FR': fr_FR.numbers,
        'de-DE': de_DE.numbers,
        'pl-PL': pl_PL.numbers,
        'it-IT': it_IT.numbers,
        'sv-SE': sv_SE.numbers,
        'zh-CN': zh_CN.numbers,
        'nl-NL': nl_NL.numbers,
        'cs-CZ': cs_CZ.numbers,
        'fi-FI': fi_FI.numbers,
    },
    datetimeFormats: {
        'en-US': en_US.datetime,
        'hr-HR': hr_HR.datetime,
        'fr-FR': fr_FR.datetime,
        'de-DE': de_DE.datetime,
        'pl-PL': pl_PL.datetime,
        'it-IT': it_IT.datetime,
        'sv-SE': sv_SE.datetime,
        'zh-CN': zh_CN.datetime,
        'nl-NL': nl_NL.datetime,
        'cs-CZ': cs_CZ.datetime,
        'fi-FI': fi_FI.datetime,
    },
    messages: {
        'en-US': en_US.messages,
        'hr-HR': hr_HR.messages,
        'fr-FR': fr_FR.messages,
        'de-DE': de_DE.messages,
        'pl-PL': pl_PL.messages,
        'it-IT': it_IT.messages,
        'sv-SE': sv_SE.messages,
        'zh-CN': zh_CN.messages,
        'nl-NL': nl_NL.messages,
        'cs-CZ': cs_CZ.messages,
        'fi-FI': fi_FI.messages,
    }
})

app.use(router)
app.use(dialog)
app.use(InstantSearch)
app.use(i18n)
app.use(ToastPlugin, {
    position: 'top',
    type: 'default',
    duration: 1500,
    pauseOnHover: true,
})

app.mount('#app')

console.info(`
                    ██▒▒██▒▒██
                      ██▒▒██▒▒
    ▒▒▒▒▒▒              ██▒▒██
  ▒▒      ▒▒          ▒▒  ██▒▒
  ▒▒  ██  ▒▒████████▒▒██    ██
  ▒▒  ██          ▒▒  ██
    ▒▒██░░░░░░░░▒▒░░░░██
        ██░░░░░░░░░░██
          ██░░░░░░██
            ██████
              ██
              ██
              ██
              ██
              ██
          ████░░████            `)
