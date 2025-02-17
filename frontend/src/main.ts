import "./static/css/index.scss";
import './static/css/animate.css';
import { createSSRApp } from "vue";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  return {
    app,
  };
}
