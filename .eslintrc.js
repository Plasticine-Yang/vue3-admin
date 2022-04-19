// @ts-check
const { defineConfig } = require('eslint-define-config');
module.exports = defineConfig({
  root: true, // 指定为根配置，防止有上级的 eslint 继续向上查找配置文件
  env: {
    browser: true,
    node: true,
    es6: true, // 开启 es6 支持
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module',
    jsxPragma: 'React',
    ecmaFeatures: {
      jsx: true, // 开启 jsx 支持
    },
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended',
  ],
  rules: {
    // 遇到不需要的 lint 检查的时候在这里配置关闭
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
});
