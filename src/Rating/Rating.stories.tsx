import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Rating } from './Rating';
import { RatingInput } from './RatingInput';

const meta = {
    title: 'Components/Rating',
    component: Rating,
    tags: ['autodocs'],
    args: { value: 4.8, count: 212 },
    argTypes: {
        value: { control: { type: 'number', min: 0, max: 5, step: 0.1 } },
    },
} satisfies Meta<typeof Rating>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCount: Story = { args: { count: undefined } };

/** Fractions fill part of a star. */
export const Fractions: Story = {
    render: () => (
        <div style={{ display: 'grid', gap: 8 }}>
            {[0, 1.5, 3.2, 4.5, 5].map((value) => (
                <Rating key={value} value={value} count={value * 10} />
            ))}
        </div>
    ),
};

/** The size follows the font size. */
export const Large: Story = {
    render: (args) => (
        <div style={{ fontSize: 24 }}>
            <Rating {...args} />
        </div>
    ),
};

function InputDemo({ disabled }: { disabled?: boolean }) {
    const [value, setValue] = useState(0);
    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <RatingInput
                aria-label="Your rating"
                value={value}
                onValueChange={setValue}
                disabled={disabled}
            />
            <span style={{ font: 'var(--tintora-font-body)' }}>
                {value ? `You gave ${value} of 5.` : 'No rating yet.'}
            </span>
        </div>
    );
}

/** A rating the user sets: radio buttons drawn as stars. */
export const Input: Story = { render: () => <InputDemo /> };

export const InputDisabled: Story = {
    render: () => <InputDemo disabled />,
};
