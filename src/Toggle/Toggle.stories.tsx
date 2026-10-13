import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Toggle } from './Toggle';
import { ToggleItem } from './ToggleItem';

type Theme = 'light' | 'dark';

const meta = {
    title: 'Components/Toggle',
    component: Toggle,
    tags: ['autodocs'],
    args: { 'aria-label': 'Theme' },
} satisfies Meta<typeof Toggle>;
export default meta;

type Story = StoryObj<typeof meta>;

/** The design's theme switch: a dot for light, a moon for dark. */
const LightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="5" fill="currentColor" />
    </svg>
);
const MoonIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
);

const themeItems = [
    <ToggleItem key="light" value="light" aria-label="Light">
        <LightIcon />
    </ToggleItem>,
    <ToggleItem key="dark" value="dark" aria-label="Dark">
        <MoonIcon />
    </ToggleItem>,
] as const;

export const Default: Story = {
    args: { defaultValue: 'light', children: [themeItems[0], themeItems[1]] },
};

export const SecondSelected: Story = {
    args: { defaultValue: 'dark', children: [themeItems[0], themeItems[1]] },
};

/** Text items take their name from the text. On the accent fill, text is
    dimmer than the icons; see the note in Toggle.css. */
export const WithText: Story = {
    args: {
        'aria-label': 'View',
        defaultValue: 'day',
        children: [
            <ToggleItem key="day" value="day">
                Day
            </ToggleItem>,
            <ToggleItem key="week" value="week">
                Week
            </ToggleItem>,
        ],
    },
};

/** Controlled: the parent owns the value. */
export const Controlled: Story = {
    // Storybook needs a valid set of args; the render below supplies the real controlled props.
    args: { defaultValue: 'light', children: [themeItems[0], themeItems[1]] },
    render: (args) => {
        const [theme, setTheme] = useState<Theme>('light');
        return (
            <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
                <Toggle<Theme>
                    aria-label={args['aria-label']}
                    value={theme}
                    onValueChange={setTheme}
                >
                    {themeItems[0]}
                    {themeItems[1]}
                </Toggle>
                <span style={{ font: 'var(--tintora-font-caption)' }}>
                    Selected: {theme}
                </span>
            </div>
        );
    },
};

export const Disabled: Story = {
    args: {
        defaultValue: 'light',
        disabled: true,
        children: [themeItems[0], themeItems[1]],
    },
};

export const OneItemDisabled: Story = {
    args: {
        defaultValue: 'light',
        children: [
            themeItems[0],
            <ToggleItem key="dark" value="dark" aria-label="Dark" disabled>
                <MoonIcon />
            </ToggleItem>,
        ],
    },
};
