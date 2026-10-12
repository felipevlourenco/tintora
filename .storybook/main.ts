import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: ['../docs/**/*.mdx', '../src/**/*.stories.tsx'],
    addons: ['@storybook/addon-docs'],
    framework: '@storybook/react-vite',
};
export default config;
