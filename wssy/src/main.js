import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import routes from '@/router/router';
import { createRouter, createWebHashHistory } from 'vue-router';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
// 新代码（正确）
import Slider from '@vueform/slider'; // 使用默认导入
// 创建路由实例
const router = createRouter({
  history: createWebHashHistory(),
  routes, // `routes: routes` 的缩写
});

// 创建并挂载根实例
const app = createApp(App);

// 使用路由
app.use(router);

// 全局注册 Element Plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 全局注册滑块组件
app.component('Slider', Slider);

// 挂载应用
app.mount('#app');