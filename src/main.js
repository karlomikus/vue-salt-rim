import { createApp } from 'vue'
import App from './App.vue'

import InstantSearch from 'vue-instantsearch/vue3/es';
import router from './router'

import './assets/main.css'

const app = createApp(App)

app.config.globalProperties.API_BASE_URL = 'http://127.0.0.1:8000';
app.config.globalProperties.SEARCH_BASE_URL = 'http://127.0.0.1:7700';
app.config.globalProperties.test = 'http://127.0.0.1:7700';

app.use(router)
app.use(InstantSearch)

app.mount('#app')
