import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Provide global $t helper to all Vue components
import { useI18nStore } from './stores/i18n'
const i18n = useI18nStore(pinia)
app.config.globalProperties.$t = i18n.t

app.mount('#app')
