module.exports = {
  root: true,
  extends: ['@nuxt/eslint-config'],
  rules: {
    'vue/no-multiple-template-root': 'off',
    'vue/no-template-shadow': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/valid-v-slot': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-indent': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/require-prop-types': 'off',
  }
}
