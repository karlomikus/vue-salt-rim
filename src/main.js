import { createApp } from 'vue'
import App from './App.vue'
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

import InstantSearch from 'vue-instantsearch/vue3/es';
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.config.globalProperties.searchUrl = import.meta.env.VITE_SEARCH_URL;
app.config.globalProperties.searchKey = import.meta.env.VITE_SEARCH_KEY;

app.use(router)
app.use(InstantSearch)
app.use(ToastPlugin, {
    position: 'top',
    type: 'default'
});

app.mount('#app')
