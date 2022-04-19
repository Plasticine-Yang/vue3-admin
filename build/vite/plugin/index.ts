import { PluginOption } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import legacy from '@vitejs/plugin-legacy';

import WindiCSS from 'vite-plugin-windicss';
import { configHtmlPlugin } from './html';

export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean) {
  const { VITE_LEGACY } = viteEnv;

  const vitePlugins: (PluginOption | PluginOption[])[] = [vue(), vueJsx()];

  // vite-plugin-windicss
  vitePlugins.push(WindiCSS());

  // @vitejs/plugin-legacy -- 开启了 VITE_LEGACY 且是在构建模式下才加载 legacy 插件
  VITE_LEGACY && isBuild && vitePlugins.push(legacy());

  // vite-plugin-html
  vitePlugins.push(configHtmlPlugin(viteEnv, isBuild));

  return vitePlugins;
}
