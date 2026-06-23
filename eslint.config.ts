import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*'],
    },

    {
      rules: {
        "@typescript-eslint/no-explicit-any": ['off'],
        "@typescript-eslint/no-unused-vars": ['off'],
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-this-alias": "off",
      }
    },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
)
