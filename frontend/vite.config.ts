import { defineConfig, loadEnv } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import * as path from 'path';

export default defineConfig(({ mode }) => {
  //手动导入 .env文件
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [uni()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@qiun/uni-ucharts': path.resolve(
          __dirname,
          'node_modules/@qiun/uni-ucharts'
        ),
      },
    },
    envDir: './',
    optimizeDeps: {
      include: ['@qiun/ucharts'],
    },
  };
});
