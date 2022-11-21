import { createApp } from 'vue'
import App from './App.vue'
import ToastPlugin from 'vue-toast-notification';
import InstantSearch from 'vue-instantsearch/vue3/es';
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.config.globalProperties.app_version = 'v0.4.0';

app.use(router)
app.use(InstantSearch)
app.use(ToastPlugin, {
    position: 'top',
    type: 'default',
    duration: 4000,
});

app.mount('#app')
