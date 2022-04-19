import { ConfigEnv, UserConfig, defineConfig, loadEnv } from 'vite';

import moment from 'moment';

import * as path from 'path';
import pkg from './package.json';

import generateModifyVars from './build/generate/generateModifyVars';
import { OUTPUT_DIR } from './build/constant';
import { wrapperEnv } from './build/utils';
import { createVitePlugins } from './build/vite/plugin';

const { dependencies, devDependencies, name, version } = pkg;
const __APP_INFO__ = {
  pkg: { dependencies, devDependencies, name, version },
  lastBuildTime: moment().format('YYYY-MM-DD HH:mm:ss'),
};

// 以 UserConfigFn 的方式导出配置
export default defineConfig(({ mode, command }: ConfigEnv): UserConfig => {
  const root = process.cwd();
  // 第三个参数是可选的，默认只会加载 VITE 前缀的环境变量，可以传入自定义想要的前缀
  // const env = loadEnv(mode, root, ['VITE', 'OTHER_PREFIX']);
  const env = loadEnv(mode, root);

  const viteEnv = wrapperEnv(env);

  const { VITE_PUBLIC_PATH, VITE_DROP_CONSOLE } = viteEnv;

  const isBuild = command === 'build';

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    build: {
      target: 'es2015',
      outDir: OUTPUT_DIR,
      terserOptions: {
        compress: {
          // Pass true to prevent Infinity from being compressed into 1/0, which may cause performance issues on Chrome.
          keep_infinity: true,
          drop_console: VITE_DROP_CONSOLE,
        },
      },
      // 启用/禁用 gzip 压缩大小报告。压缩大型输出文件可能会很慢，因此禁用该功能可能会提高大型项目的构建性能
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
    },
    // 全局常量替换
    define: {
      __INFINITY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
    plugins: createVitePlugins(viteEnv, isBuild),
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: generateModifyVars(),
          javascriptEnabled: true,
        },
      },
    },
  };
});
