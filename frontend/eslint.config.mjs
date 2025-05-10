import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default [
  // 基础配置
  { files: [ '**/*.{js,mjs,cjs,ts,vue}' ] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],

  // 全局变量配置
  {
    files: [ '**/*.vue' ],
    languageOptions: {
      globals: {
        ...globals.browser,   // 继承浏览器环境全局变量
        uni: 'readonly',       // 新增自定义全局变量
      },
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },

  // 规则覆盖
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // 关键规则
    },
  },
];