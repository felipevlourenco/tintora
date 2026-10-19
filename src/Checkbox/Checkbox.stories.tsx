import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
/* eslint-disable jsx-a11y/label-has-associated-control -- the rule can't see that Checkbox renders an input */
import { Checkbox } from './Checkbox';

const meta = {
    title: 'Components/Checkbox',
    component: Checkbox,
    tags: ['autodocs'],
    args: { 'aria-label': 'Accept' },
} satisfies Meta<typeof Checkbox>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = { args: { indeterminate: true } };

export const Disabled: Story = {
    render: ({ 'aria-label': label }) => (
        <div style={{ display: 'flex', gap: 16 }}>
            <Checkbox aria-label={label} disabled />
            <Checkbox aria-label={label} disabled defaultChecked />
            <Checkbox aria-label={label} disabled indeterminate />
        </div>
    ),
};

/** A select-all that shows the mixed state while only some children are checked. */
export const SelectAll: Story = {
    render: () => {
        const [items, setItems] = useState([true, false, false]);
        const count = items.filter(Boolean).length;
        return (
            <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: 'flex', gap: 12 }}>
                    <Checkbox
                        aria-label="Select all"
                        checked={count === items.length}
                        indeterminate={count > 0 && count < items.length}
                        onCheckedChange={(on) => setItems(items.map(() => on))}
                    />
                    Select all
                </label>
                {items.map((on, i) => (
                    <label key={i} style={{ display: 'flex', gap: 12 }}>
                        <Checkbox
                            aria-label={`Item ${i + 1}`}
                            checked={on}
                            onCheckedChange={(v) =>
                                setItems(items.map((x, j) => (j === i ? v : x)))
                            }
                        />
                        Item {i + 1}
                    </label>
                ))}
            </div>
        );
    },
};
