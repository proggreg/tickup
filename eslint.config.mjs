// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      'vue/html-indent': 'off',
      '@stylistic/js/indent': 'off',
      'indent': ['error', 4],
      '@stylistic/ts/indent': ['error', 4],
      '@typescript-eslint/no-explicit-any': 'off',
      '@stylistic/indent': 'off',
      'vue/html-indent': 'off',
  },
)
