import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

import WindiCSS from 'vite-plugin-windicss';

import { createHtmlPlugin } from 'vite-plugin-html';

import * as path from 'path';

import generateModifyVars from './build/generate/generateModifyVars';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    vue(),
    WindiCSS(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'plasticine',
        },
        tags: [
          {
            tag: 'script',
            attrs: {
              src: '/_app.config.js',
            },
          },
        ],
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: generateModifyVars(),
        javascriptEnabled: true,
      },
    },
  },
});
