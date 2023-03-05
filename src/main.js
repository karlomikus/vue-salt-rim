import { createApp } from 'vue'
import App from './App.vue'
import ToastPlugin from 'vue-toast-notification';
import InstantSearch from 'vue-instantsearch/vue3/es';
import router from './router'
import mitt from 'mitt'
import dialog from './components/Dialog/plugin';
import './assets/main.css'

const emitter = mitt()
const app = createApp(App)

app.config.globalProperties.app_version = 'v1.6.0';
app.config.globalProperties.$eventBus = emitter;

app.use(router)
app.use(dialog)
app.use(InstantSearch)
app.use(ToastPlugin, {
    position: 'top',
    type: 'default',
    duration: 4000,
});

app.mount('#app')
