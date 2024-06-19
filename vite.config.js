import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html'),  // 指定入口文件为 src/index.html
      output: {
        format: 'es', // 确保输出为ES模块
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: './', // 确保打包后的路径适用于Electron
});