import type { Preview } from '@storybook/react-vite';
import '../src/tokens.css';

const preview: Preview = {
    globalTypes: {
        theme: {
            description: 'Theme',
            toolbar: {
                icon: 'circlehollow',
                items: [
                    { value: 'dark', title: 'Dark' },
                    { value: 'light', title: 'Light' },
                ],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { theme: 'dark' },
    decorators: [
        (Story, { globals }) => {
            document.documentElement.dataset.theme = globals.theme;
            return Story();
        },
    ],
};

export default preview;
