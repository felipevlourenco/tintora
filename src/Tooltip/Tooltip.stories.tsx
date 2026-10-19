import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonHTMLAttributes } from 'react';
import { Tooltip } from './Tooltip';

// Passes aria-describedby (and any other prop) on to the button, as a trigger must.
const Trigger = (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
        {...props}
        type="button"
        style={{
            width: 96,
            height: 36,
            padding: 0,
            border: '1px solid transparent',
            borderRadius: 'var(--tintora-radius-pill)',
            font: 'var(--tintora-font-label)',
            color: 'var(--tintora-text)',
            background: 'var(--tintora-fill-subtle)',
        }}
    >
        Hover me
    </button>
);

const meta = {
    title: 'Components/Tooltip',
    component: Tooltip,
    tags: ['autodocs'],
    args: { content: 'Heart rate', children: <Trigger /> },
} satisfies Meta<typeof Tooltip>;
export default meta;

type Story = StoryObj<typeof meta>;

/** A dashed 260×120 zone, as in the design, with room on every side. */
const Zone = ({ children }: { children: React.ReactNode }) => (
    <div
        style={{
            display: 'grid',
            placeItems: 'center',
            width: 260,
            height: 120,
            boxSizing: 'border-box',
            border: '1px dashed var(--tintora-line-strong)',
            borderRadius: 'var(--tintora-radius-16)',
        }}
    >
        {children}
    </div>
);

export const Default: Story = {
    render: (args) => (
        <Zone>
            <Tooltip {...args} />
        </Zone>
    ),
};

export const Placements: Story = {
    render: (args) => (
        <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
            {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
                <Zone key={placement}>
                    <Tooltip {...args} placement={placement} />
                </Zone>
            ))}
        </div>
    ),
};

export const WithShortcut: Story = {
    args: { content: 'Search', shortcut: 'Ctrl K', placement: 'bottom' },
    render: Default.render,
};

export const Rich: Story = {
    args: {
        title: 'Heart rate zone',
        content: 'Average over your last 7 workouts.',
        placement: 'right',
    },
    render: Default.render,
};
