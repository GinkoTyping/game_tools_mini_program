import './static/css/index.scss';
import './static/css/animate.css';
import './iconfont/iconfont.css';
import { createSSRApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);

  const pinia = createPinia();
  app.use(pinia);

  return {
    app,
  };
}
