import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Stepper } from './Stepper';

const checkout = [
    { label: 'Cart' },
    { label: 'Details and payment' },
    { label: 'Confirmation' },
];

const meta = {
    title: 'Components/Stepper',
    component: Stepper,
    tags: ['autodocs'],
    args: { steps: checkout, current: 1 },
    argTypes: {
        current: { control: { type: 'number', min: 0, max: 3 } },
    },
} satisfies Meta<typeof Stepper>;
export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The middle step of a checkout: Cart is done, Confirmation is next. On a
 * phone (viewport under 480px) only the current label stays on screen; use
 * the viewport toolbar to check it.
 */
export const Default: Story = {};

export const FirstStep: Story = { args: { current: 0 } };

export const LastStep: Story = { args: { current: 2 } };

/** `current` equal to the number of steps: the flow is finished. */
export const AllComplete: Story = { args: { current: 3 } };

export const FiveSteps: Story = {
    args: {
        current: 2,
        steps: [
            { label: 'Account' },
            { label: 'Address' },
            { label: 'Shipping' },
            { label: 'Payment' },
            { label: 'Review' },
        ],
    },
};

function ClickableDemo() {
    const [current, setCurrent] = useState(1);
    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <Stepper
                steps={checkout}
                current={current}
                onStepClick={setCurrent}
            />
            <div>
                <Button
                    variant="primary"
                    disabled={current >= checkout.length}
                    onClick={() => setCurrent(current + 1)}
                >
                    Continue
                </Button>
            </div>
        </div>
    );
}

/** With `onStepClick`, a complete step is a button that goes back to it. */
export const ClickableSteps: Story = { render: () => <ClickableDemo /> };
