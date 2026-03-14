import { createApp } from 'vue'
import { createPinia } from 'pinia'
import AmuUI from 'amu-ui'
import 'amu-ui/theme'
import App from './App.vue'
import router from './router'
import './style.css'
import { setupPermissionDirective } from './directives/permission'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.use(AmuUI)
setupPermissionDirective(app)
app.mount('#app')
