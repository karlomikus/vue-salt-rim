import { createApp } from 'vue'
import App from './App.vue'
import ToastPlugin from 'vue-toast-notification';
import InstantSearch from 'vue-instantsearch/vue3/es';
import router from './router'
import 'vue-toast-notification/dist/theme-default.css';
import './assets/main.css'

const app = createApp(App)

app.config.globalProperties.searchUrl = window.srConfig.SEARCH_URL//import.meta.env.VITE_SEARCH_URL;
app.config.globalProperties.searchKey = window.srConfig.SEARCH_KEY//import.meta.env.VITE_SEARCH_KEY;
app.config.globalProperties.app_version = 'v0.1.0';

app.use(router)
app.use(InstantSearch)
app.use(ToastPlugin, {
    position: 'top',
    type: 'default',
    duration: 4000,
});

app.mount('#app')
