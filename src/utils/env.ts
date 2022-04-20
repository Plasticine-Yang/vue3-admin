import { GlobEnvConfig } from '#/config';
import { getConfigFileName } from '../../build/utils';
import { warn } from './log';

/**
 * 获取全局环境变量
 */
export function getAppEnvConfig() {
  const ENV_NAME = getConfigFileName(import.meta.env);

  // 区分开发环境和生产环境的环境变量
  const ENV = (import.meta.env.DEV
    ? (import.meta.env as unknown as GlobEnvConfig)
    : window[ENV_NAME as any]) as unknown as GlobEnvConfig;

  const {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_UPLOAD_URL,
  } = ENV;

  // 对 VITE_GLOB_APP_SHORT_NAME 进行检测，不符合命名规范时给出警告
  if (!/[a-zA-Z]\_*/.test(VITE_GLOB_APP_SHORT_NAME)) {
    warn(
      `VITE_GLOB_APP_SHORT_NAME Variables can only be characters/underscores, please modify in the environment variables and re-running.`,
    );
  }

  return {
    VITE_GLOB_APP_TITLE,
    VITE_GLOB_API_URL,
    VITE_GLOB_API_URL_PREFIX,
    VITE_GLOB_APP_SHORT_NAME,
    VITE_GLOB_UPLOAD_URL,
  };
}

export const devMode = 'development';

export const prodMode = 'production';

export function getEnvMode(): string {
  return import.meta.env.MODE;
}

export function isDevMode(): boolean {
  return import.meta.env.DEV;
}

export function isProdMode(): boolean {
  return import.meta.env.PROD;
}

/**
 * 获取 storage 的 prefixKey
 */
export function getStoragePrefixKey() {
  const { VITE_GLOB_APP_SHORT_NAME } = getAppEnvConfig();
  return `${VITE_GLOB_APP_SHORT_NAME}__${getEnvMode()}`.toUpperCase();
}
