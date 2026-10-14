import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Select, type SelectProps } from './Select';
import { type SelectOption } from './SelectOption';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

const frequencies: SelectOption<Frequency>[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

const meta = {
    title: 'Components/Select',
    component: Select,
    tags: ['autodocs'],
    args: { 'aria-label': 'Frequency' },
    // The trigger is made for cards, which are light in both themes.
    decorators: [
        (Story) => (
            <div
                style={{
                    display: 'inline-flex',
                    padding: '14px',
                    minWidth: 220,
                    minHeight: 220,
                    alignItems: 'flex-start',
                    borderRadius: 'var(--tintora-radius-18)',
                    background: 'var(--tintora-surface-card)',
                }}
            >
                <Story />
            </div>
        ),
    ],
} satisfies Meta<SelectProps<Frequency>>;
export default meta;

type Story = StoryObj<SelectProps<Frequency>>;

/** Nothing selected: the placeholder shows. */
export const Default: Story = {
    args: { options: frequencies, placeholder: 'Frequency' },
};

export const WithValue: Story = {
    args: { options: frequencies, defaultValue: 'weekly' },
};

/** The parent owns the value. */
export const Controlled: Story = {
    // Storybook needs a valid set of args; the render below supplies the real controlled props.
    args: { options: frequencies, defaultValue: 'weekly' },
    render: () => {
        const [value, setValue] = useState<Frequency | null>('weekly');
        return (
            <div style={{ display: 'grid', gap: 12 }}>
                <Select<Frequency>
                    aria-label="Frequency"
                    options={frequencies}
                    value={value}
                    onValueChange={setValue}
                />
                <span
                    style={{
                        font: 'var(--tintora-font-caption)',
                        color: 'var(--tintora-text-on-card-muted)',
                    }}
                >
                    value: {value ?? 'none'}
                </span>
            </div>
        );
    },
};

/** Disabled options are skipped by the keyboard and cannot be picked. */
export const DisabledOption: Story = {
    args: {
        defaultValue: 'daily',
        options: frequencies.map((option) =>
            option.value === 'monthly' ? { ...option, disabled: true } : option,
        ),
    },
};

export const Disabled: Story = {
    args: { options: frequencies, defaultValue: 'weekly', disabled: true },
};

/** `name` adds a hidden input, so the value is part of the form data. */
export const InForm: Story = {
    args: { options: frequencies, name: 'frequency', defaultValue: 'weekly' },
};
