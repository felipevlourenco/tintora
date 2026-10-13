import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../docs/**/*.mdx', '../src/**/*.stories.tsx'],
    addons: [
        '@storybook/addon-docs',
        '@storybook/addon-a11y',
        'storybook-addon-pseudo-states',
    ],
    framework: '@storybook/react-vite',
};
export default config;
