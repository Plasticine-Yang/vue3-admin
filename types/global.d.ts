// import type { VNode } from 'vue';

declare global {
  type Recordable<T = any> = Record<string, T>;
  interface ViteEnv {
    VITE_PORT: number; // 端口号
    VITE_USE_MOCK: boolean; // 是否开启mock数据，关闭时需要自行对接后台接口
    VITE_USE_PWA: boolean; // 打包是否开启pwa功能
    VITE_PUBLIC_PATH: string; // 资源公共路径,需要以 / 开头和结尾
    VITE_PROXY: [string, string][]; // 本地开发代理，可以解决跨域及多地址代理，可以有多个，注意多个不能换行，否则代理将会失效
    VITE_GLOB_APP_TITLE: string; // 网站标题
    VITE_GLOB_APP_SHORT_NAME: string; // 简称，用于配置文件名字 不要出现空格、数字开头等特殊字符
    VITE_USE_CDN: boolean;
    VITE_DROP_CONSOLE: boolean; // 是否删除Console.log
    VITE_BUILD_COMPRESS: 'gzip' | 'brotli' | 'none'; // 打包是否输出gz｜br文件，也可以有多个, 例如 ‘gzip’|'brotli',这样会同时生成 .gz和.br文件
    VITE_BUILD_COMPRESS_DELETE_ORIGIN_FILE: boolean;
    VITE_LEGACY: boolean; // 是否兼容旧版浏览器。开启后打包时间会慢一倍左右。会多打出旧浏览器兼容包,且会根据浏览器兼容性自动使用相应的版本
    VITE_USE_IMAGEMIN: boolean; // 打包是否压缩图片
    VITE_GENERATE_UI: string;
  }
}

export {};
