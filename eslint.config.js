import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import storybook from 'eslint-plugin-storybook';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    { ignores: ['dist', 'storybook-static'] },
    js.configs.recommended,
    tseslint.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    reactHooks.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
    storybook.configs['flat/recommended'],
    {
        languageOptions: { globals: globals.browser },
        settings: { react: { version: 'detect' } },
    },
    prettier,
);
