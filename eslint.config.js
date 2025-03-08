import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVitest from '@vitest/eslint-plugin'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  pluginVue.configs['flat/base'],
  vueTsConfigs.recommended,

  {
    rules: {
      "vue/html-indent": ["warn", 4],
      "vue/max-attributes-per-line": ['off'],
      "vue/block-lang": ['off'],
      "vue/multiline-html-element-content-newline": ['off'],
      "vue/html-self-closing": ['off'],
      "vue/no-v-html": ['off'],
      "vue/singleline-html-element-content-newline": ['off'],
      "vue/v-on-event-hyphenation": ['warn', 'always', {
        autofix: true
      }],
      "@typescript-eslint/no-explicit-any": ['off'],
      "@typescript-eslint/no-unused-vars": ['off'],
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-this-alias": "off",
    }
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
  },
)

// export default {
//   root: true,
//   extends: [
//     'eslint:recommended',
//     'plugin:vue/vue3-recommended',
//     '@vue/eslint-config-typescript',
//   ],
  // rules: {
  //   "vue/html-indent": ["warn", 4],
  //   "vue/max-attributes-per-line": ['off'],
  //   "vue/multiline-html-element-content-newline": ['off'],
  //   "vue/html-self-closing": ['off'],
  //   "vue/no-v-html": ['off'],
  //   "vue/singleline-html-element-content-newline": ['off'],
  //   "vue/v-on-event-hyphenation": ['warn', 'always', {
  //     autofix: true
  //   }],
  //   parserOptions: {
  //     ecmaVersion: 'latest'
  //   },
  //   "indent": ["error", 4],
  //   "linebreak-style": ["error", "unix"],
  //   "quotes": ["error", "single"],
  //   "semi": ["error", "never"],
  // }
// }
