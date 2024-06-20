import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { terser } from 'rollup-plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: resolve(__dirname, 'src/index.html'),  // 指定入口文件为 src/index.html
      plugins: [
        terser(),  // 使用 terser 插件压缩代码
        visualizer({
          open: true,      // 使用 visualizer 插件生成依赖图并自动打开
          gzipSize: true,  // 显示 gzip 压缩大小
          brotliSize: true // 显示 brotli 压缩大小
        })
      ],
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