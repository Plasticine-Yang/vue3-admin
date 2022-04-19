import chalk from 'chalk';

import fs, { writeFileSync } from 'fs-extra';

import { GLOB_CONFIG_FILE_NAME, OUTPUT_DIR } from '../constant';
import { getEnvConfig, getConfigFileName, getRootPath } from '../utils';
import pkg from '../../package.json';

// 配置参数类型
interface CreateConfigParams {
  configName: string;
  config: any;
  configFileName?: string;
}

/**
 * 根据配置参数去动态生成 window.项目配置属性 = { 配置项 }
 * 然后生成 _app.config.js 到打包输出目录下
 * @param params 配置参数
 */
function createConfig(params: CreateConfigParams) {
  const { configName, config, configFileName } = params;

  try {
    // 1. 生成注入代码
    const windowConf = `window.${configName}`; // 生成 项目配置属性名
    // 将配置项对象挂载到 windowConf 属性名上
    // 利用 Object.defineProperty 保证配置项对象不会被修改
    const configStr = `${windowConf}=${JSON.stringify(config)};
    Object.freeze(${windowConf});
    Object.defineProperty(window, "${configName}", {
      configurable: false,
      writable: false
    });`.replace(/\s/g, ''); // 去除空白字符

    // 2. 检查构建目录是否存在，不存在则会创建 -- 注意：用的是 fs-extra 而不是 fs
    fs.mkdirp(getRootPath(OUTPUT_DIR));

    // 3. 创建动态生成的配置文件到 OUTPUT_DIR 目录下，并且将注入的代码写入该文件中
    writeFileSync(getRootPath(OUTPUT_DIR, configFileName ?? '_app.config.js'), configStr);

    // 4. 输出配置文件生成成功信息
    console.log(chalk.cyan(`⭐ [${pkg.name}]`) + ` - configuration file is build successfully:`);
    console.log(chalk.gray(OUTPUT_DIR + '/' + chalk.green(configFileName)) + '\n');
  } catch (error) {
    console.log(chalk.red('❌ configuration file configuration file failed to package:\n' + error));
  }
}

export function runBuildConfig() {
  // 读取指定前缀的环境变量 -- 默认前缀为 VITE_GLOB_
  // 如 .env 中有 VITE_GLOB_PLASTICINE = plasticine
  // 则 config.VITE_GLOB_PLASTICINE === 'plasticine'
  const config = getEnvConfig();
  // 读取配置文件变量名 -- 会被挂载到 window 对象上，并加上前后缀
  // 如读取到配置 VITE_GLOB_APP_SHORT_NAME = plasticine_admin
  // 则会有 window.__PRODUCTION__PLASTICINE_ADMIN__CONF__ 作为整个项目的配置
  const configFileName = getConfigFileName(config);

  // 根据配置文件的配置创建配置信息
  createConfig({ config, configName: configFileName, configFileName: GLOB_CONFIG_FILE_NAME });
}
