import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * 获取当前环境下生效的配置文件名
 */
function getConfFiles() {
  // 1. 获取执行的脚本 如运行 npx esno ./build/utils.ts --> esno .\\\\build\\\\utils.ts
  const script = process.env.npm_lifecycle_script;
  // 2. 用正则表达式匹配运行环境
  const reg = new RegExp('--mode ([a-z_\\d]+)');
  const result = reg.exec(script as string) as any;

  if (result) {
    // 传入了 mode 参数则使用对应的环境
    const mode = result[1] as string;
    return ['.env', `.env.${mode}`];
  }
  // 否则默认是生产环境
  return ['.env', '.env.production'];
}

/**
 * 获取指定前缀的环境变量
 * @param match 前缀
 * @param confFiles ext
 */
export function getEnvConfig(match = 'VITE_GLOB_', confFiles = getConfFiles()) {
  let envConfig = {};

  // 读取 confFiles 中的键值对配置项到 envConfig 对象中
  confFiles.forEach((item) => {
    try {
      // 读取当前脚本执行目录下的 confFiles 中的文件
      // 得到的 env 就是配置文件中的键值对
      const env = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), item)));
      envConfig = { ...envConfig, ...env };
    } catch (e) {
      console.error(`Error in parsing ${item}`, e);
    }
  });

  // 只匹配 match 开头的配置项
  const reg = new RegExp(`^(${match})`);
  Object.keys(envConfig).forEach((key) => {
    if (!reg.test(key)) {
      // 不匹配的项利用 Reflect 反射将其从 envConfig 对象中删除
      Reflect.deleteProperty(envConfig, key);
    }
  });
  return envConfig;
}

/**
 * 获取配置文件的变量名
 * @param env
 */
export const getConfigFileName = (env: Record<string, any>) => {
  // 读取配置项 VITE_GLOB_APP_SHORT_NAME 进行拼接，没有配置该项则默认用 __APP
  return `__PRODUCTION__${env.VITE_GLOB_APP_SHORT_NAME || '__APP'}__CONF__`.toUpperCase().replace(/\s/g, ''); // 去除空白字符
};

/**
 * 获取 dir 相对于项目根目录的绝对路径
 * @param dir file path
 */
export function getRootPath(...dir: string[]) {
  return path.resolve(process.cwd(), ...dir);
}

/**
 * 将 loadEnv 加载的配置对象转成类型正确的配置对象，并将它们挂载到 process.env 中
 * @param envConf loadEnv 加载的配置
 * @returns 类型正确的配置对象
 */
export function wrapperEnv(envConf: Recordable): ViteEnv {
  const res: any = {};

  // 1. 遍历所有的配置项的 key
  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName];

    // 2. 进行一些类型转换

    // 将 boolean 字符串转成 boolean 类型
    realName = realName === 'true' ? true : realName === 'false' ? false : realName;

    // VUTE_PORT 是 number 类型
    if (envName === 'VITE_PORT') realName = Number(realName);

    // VITE_PROXY 可能是单个字符串也可能是数组
    if (envName === 'VITE_PROXY' && realName) {
      try {
        // JSON 中没有单引号，为了防止出错需要将单引号替换成双引号
        realName = JSON.parse(realName.replace(/\'/, '"'));
      } catch (error) {
        realName = '';
      }
    }

    // 3. 将结果拷贝到新对象中
    res[envName] = realName;

    // 4. 将配置项放到 process.env 中，值只能是字符串，因此遇到对象要进行序列化
    if (typeof realName === 'string') process.env[envName] = realName;
    else if (typeof realName === 'object') process.env[envName] = JSON.stringify(realName);
    else process.env[envName] = realName.toString();
  }

  return res;
}
