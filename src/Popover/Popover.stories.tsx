import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Popover, type PopoverProps } from './Popover';

// The parent owns `open`, so the story wires the trigger to its own state;
// `open`, `onOpenChange` and `trigger` from the controls are overridden.
function Demo({
    label,
    defaultOpen = true,
    ...props
}: Omit<PopoverProps, 'open' | 'onOpenChange' | 'trigger'> &
    Partial<Pick<PopoverProps, 'open' | 'onOpenChange' | 'trigger'>> & {
        label: string;
        defaultOpen?: boolean;
    }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <Popover
            {...props}
            open={open}
            onOpenChange={setOpen}
            trigger={
                <Button variant="secondary" size="small">
                    {label}
                </Button>
            }
        />
    );
}

const meta = {
    title: 'Components/Popover',
    component: Popover,
    tags: ['autodocs'],
    args: {
        open: true,
        onOpenChange: () => {},
        trigger: <button type="button">Edit goal</button>,
        title: 'Daily step goal',
        children: null,
        placement: 'top',
    },
    // Owned by the story's Demo, or its content: a control would do nothing.
    argTypes: {
        open: { table: { disable: true } },
        onOpenChange: { table: { disable: true } },
        trigger: { table: { disable: true } },
        children: { table: { disable: true } },
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Popover>;
export default meta;

type Story = StoryObj<typeof meta>;

const GOALS = ['8,000', '10,000', '12,000'];

const GoalPicker = () => (
    <>
        <div>
            <div style={{ font: 'var(--tintora-font-heading)' }}>
                Daily step goal
            </div>
            <div
                style={{
                    marginTop: 4,
                    fontSize: 12.5,
                    color: 'var(--tintora-text-muted)',
                }}
            >
                Pick a target you can hit on most days.
            </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
            {GOALS.map((goal) => (
                <Button
                    key={goal}
                    variant={goal === '10,000' ? 'primary' : 'secondary'}
                    size="small"
                    aria-pressed={goal === '10,000'}
                >
                    {goal}
                </Button>
            ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button variant="ghost" size="small">
                Cancel
            </Button>
            <Button variant="primary" size="small">
                Save
            </Button>
        </div>
    </>
);

/** A small task in a 300px panel: a choice, then Cancel or Save. */
export const Default: Story = {
    render: (args) => (
        <Demo {...args} label="Edit goal">
            <GoalPicker />
        </Demo>
    ),
};

/** Starts closed: press the trigger to open it, Esc or an outside click to close. */
export const StartsClosed: Story = {
    render: (args) => (
        <Demo {...args} label="Edit goal" defaultOpen={false}>
            <GoalPicker />
        </Demo>
    ),
};

/**
 * `alertdialog` and the compact size: it fills its container, and focus starts
 * on the safe action ("Keep"). The destructive button is always last.
 */
export const Confirm: Story = {
    args: {
        title: 'Delete this workout',
        role: 'alertdialog',
        size: 'sm',
    },
    render: (args) => (
        <div style={{ width: 320 }}>
            <Demo {...args} label="Delete">
                <div>
                    <div style={{ font: 'var(--tintora-font-subtitle)' }}>
                        Delete this workout?
                    </div>
                    <div
                        style={{
                            marginTop: 4,
                            fontSize: 12.5,
                            color: 'var(--tintora-text-muted)',
                        }}
                    >
                        {"This can't be undone."}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" size="small" data-autofocus>
                        Keep
                    </Button>
                    <Button
                        variant="primary"
                        size="small"
                        style={{
                            background: 'var(--tintora-color-destructive)',
                            color: 'var(--tintora-color-on-destructive)',
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </Demo>
        </div>
    ),
};

/** The four sides of the trigger. The arrow always points at it. */
export const Placements: Story = {
    // Each trigger asks for its own side.
    argTypes: { placement: { table: { disable: true } } },
    parameters: { layout: 'fullscreen' },
    render: (args) => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 220,
                padding: '220px 360px',
            }}
        >
            {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
                <Demo
                    {...args}
                    key={placement}
                    label={placement}
                    title={`Opens on the ${placement}`}
                    placement={placement}
                >
                    <div style={{ font: 'var(--tintora-font-heading)' }}>
                        Opens on the {placement}
                    </div>
                </Demo>
            ))}
        </div>
    ),
};

/** Not enough room below the trigger: it opens above instead. */
export const FlipsAtTheEdge: Story = {
    args: { placement: 'bottom' },
    parameters: { layout: 'fullscreen' },
    render: (args) => (
        <div style={{ position: 'fixed', inset: 0 }}>
            <div style={{ position: 'absolute', bottom: 8, left: 200 }}>
                <Demo {...args} label="Edit goal">
                    <GoalPicker />
                </Demo>
            </div>
        </div>
    ),
};
