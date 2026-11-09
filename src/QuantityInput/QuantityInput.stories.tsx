import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { QuantityInput } from './QuantityInput';

const meta = {
    title: 'Components/QuantityInput',
    component: QuantityInput,
    tags: ['autodocs'],
    args: { defaultValue: 1, min: 1 },
} satisfies Meta<typeof QuantityInput>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Plus stops at `max`, minus at `min`. */
export const WithLimits: Story = { args: { defaultValue: 2, min: 1, max: 5 } };

export const Step: Story = { args: { defaultValue: 10, min: 0, step: 5 } };

export const Disabled: Story = { args: { disabled: true } };

function ControlledDemo() {
    const [value, setValue] = useState(2);
    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <QuantityInput
                value={value}
                onValueChange={setValue}
                min={1}
                max={9}
            />
            <span style={{ font: 'var(--tintora-font-body)' }}>
                In your cart: {value}
            </span>
        </div>
    );
}

/** The parent owns the value, for a cart that also shows a total. */
export const Controlled: Story = { render: () => <ControlledDemo /> };
