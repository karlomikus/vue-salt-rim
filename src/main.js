import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import ToastPlugin from 'vue-toast-notification';
import InstantSearch from 'vue-instantsearch/vue3/es';
import router from './router'
import mitt from 'mitt'
import dialog from './components/Dialog/plugin';
import './assets/main.css'
import Auth from './Auth';

import en_US from './locales/en-US';
import hr_HR from './locales/hr-HR';
import fr_FR from './locales/fr-FR';
import de_DE from './locales/de-DE';

let userSelectedLocale = window.localStorage.getItem('ui-language');
if (!userSelectedLocale) {
    userSelectedLocale = window.srConfig.DEFAULT_LOCALE || 'en-US';
}

let userSelectedTheme = window.localStorage.getItem('_ba_theme');
if (userSelectedTheme == 'dark' && !document.body.classList.contains('dark-theme')) {
    document.body.classList.add('dark-theme');
    document.querySelector('meta[name="theme-color"]').setAttribute("content", '#16141A');
}

const emitter = mitt()
const app = createApp(App)
const i18n = createI18n({
    locale: userSelectedLocale,
    fallbackLocale: 'en-US',
    numberFormats: {
        'en-US': en_US.numbers,
        'hr-HR': hr_HR.numbers,
        'fr-FR': fr_FR.numbers,
        'de-DE': de_DE.numbers,
    },
    datetimeFormats: {
        'en-US': en_US.datetime,
        'hr-HR': hr_HR.datetime,
        'fr-FR': fr_FR.datetime,
        'de-DE': de_DE.datetime,
    },
    messages: {
        'en-US': en_US.messages,
        'hr-HR': hr_HR.messages,
        'fr-FR': fr_FR.messages,
        'de-DE': de_DE.messages,
    }
})

app.config.globalProperties.app_version = '{{VERSION}}';
app.config.globalProperties.$eventBus = emitter;

app.use(router)
app.use(dialog)
app.use(InstantSearch)
app.use(i18n)
app.use(ToastPlugin, {
    position: 'top',
    type: 'default',
    duration: 4000,
});

app.mount('#app')
