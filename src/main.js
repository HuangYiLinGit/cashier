import {
	createApp
} from 'vue'
import router from "./router";

import {
	createPinia
} from 'pinia'
import 'amfe-flexible'
const pinia = createPinia();
import {
	setupRouter
} from "@/router";
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import filters from '@/filters/index.js';
import {
	loadDirectives
} from "@/directive";
import "../static/css/app.css";
import "../static/css/common.css";
const app = createApp(App);
loadDirectives(app)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
}
app.use(pinia)
app.use(router)
app.mount('#app')
app.config.globalProperties.$filter = filters;
app.config.globalProperties.$numTCN = filters.numberToCurrencyNo;
setupRouter(app);