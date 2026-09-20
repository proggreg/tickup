// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-empty-pattern': 'off',
        '@typescript-eslint/unified-signatures': 'off',
    },
});
