import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import ViewUIPlus from 'view-ui-plus'
import 'view-ui-plus/dist/styles/viewuiplus.css'
import { InstallCodemirro } from "codemirror-editor-vue3"

const app = createApp(App)

app.use(router)
    .use(InstallCodemirro, { componentName: "jsonInput" })
    .use(ViewUIPlus)
    .mount('#app')
