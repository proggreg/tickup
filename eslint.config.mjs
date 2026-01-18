// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
    {
        rules: {

            // 'vue/max-attributes-per-line': 'off',
            // 'vue/singleline-html-element-content-newline': 'off',
            // '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            // 'vue/html-indent': 'off',
            '@typescript-eslint/unified-signatures': 'off',
        },
    },
);
