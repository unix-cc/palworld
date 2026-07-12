import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// Element Plus 深色主题变量 (启用 html.dark 后生效)
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as Icons from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
// 设计 token 层: 覆盖 Element Plus CSS 变量, 全组件自动跟随深色仪表盘主题
import './theme.css'

// 固定深色模式: 面板定位为服务器运维控制台, 深色数据密集风格
document.documentElement.classList.add('dark')

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
for (const [name, comp] of Object.entries(Icons)) app.component(name, comp)
app.mount('#app')
