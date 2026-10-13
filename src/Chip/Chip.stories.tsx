import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Chip } from './Chip';

const meta = {
    title: 'Components/Chip',
    component: Chip,
    tags: ['autodocs'],
    args: { children: 'Day 1' },
} satisfies Meta<typeof Chip>;
export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', alignItems: 'center', gap: 12 } as const;

/** Chips are made for cards, which are light in both themes. */
const OnCard = ({ children }: { children: React.ReactNode }) => (
    <div
        style={{
            ...row,
            padding: '12px 14px',
            borderRadius: 'var(--tintora-radius-18)',
            background: 'var(--tintora-surface-card)',
        }}
    >
        {children}
    </div>
);

export const Default: Story = {
    render: (args) => (
        <OnCard>
            <Chip {...args} />
        </OnCard>
    ),
};

export const Disabled: Story = {
    render: (args) => (
        <OnCard>
            <Chip {...args} disabled />
        </OnCard>
    ),
};

/** A toggle: `selected` makes it a button with aria-pressed. */
export const Toggle: Story = {
    render: (args) => {
        const [selected, setSelected] = useState(false);
        return (
            <div
                style={{
                    ...row,
                    padding: '12px 14px',
                    borderRadius: 'var(--tintora-radius-18)',
                    background: selected
                        ? 'var(--tintora-color-accent-deep)'
                        : 'var(--tintora-surface-card)',
                }}
            >
                <Chip
                    {...args}
                    selected={selected}
                    onClick={() => setSelected((value) => !value)}
                />
            </div>
        );
    },
};

/** The design's states. The selected look is made for the selected (accent) card. */
export const States: Story = {
    parameters: {
        pseudo: { hover: '.is-hover', focusVisible: '.is-focus' },
    },
    render: (args) => (
        <div style={row}>
            <OnCard>
                <Chip {...args}>Default</Chip>
                <Chip {...args} className="is-hover">
                    Hover
                </Chip>
                <Chip {...args} className="is-focus">
                    Focus
                </Chip>
                <Chip {...args} disabled>
                    Disabled
                </Chip>
            </OnCard>
            <div
                style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--tintora-radius-18)',
                    background: 'var(--tintora-color-accent-deep)',
                }}
            >
                <Chip {...args} selected>
                    Selected
                </Chip>
            </div>
        </div>
    ),
};
