import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Slider } from './Slider';

const meta = {
    title: 'Components/Slider',
    component: Slider,
    tags: ['autodocs'],
    args: { 'aria-label': 'Volume', defaultValue: 40 },
    decorators: [
        (Story) => (
            <div style={{ width: 'min(360px, 100%)' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Slider>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** `formatValue` shows the value, and is read out as the value text. */
export const WithValue: Story = {
    args: {
        'aria-label': 'Maximum price',
        min: 0,
        max: 500,
        step: 10,
        defaultValue: 120,
        formatValue: (value) => `$${value}`,
    },
};

export const Disabled: Story = { args: { disabled: true } };

function ControlledDemo() {
    const [value, setValue] = useState(30);
    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <Slider
                aria-label="Maximum price"
                min={0}
                max={200}
                value={value}
                onValueChange={setValue}
                formatValue={(v) => `$${v}`}
            />
            <span style={{ font: 'var(--tintora-font-body)' }}>
                Showing items up to ${value}.
            </span>
        </div>
    );
}

/** The parent owns the value, for a filter that updates a list. */
export const Controlled: Story = { render: () => <ControlledDemo /> };
