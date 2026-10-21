import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Switch } from '../Switch/Switch';
import { TextField } from '../TextField/TextField';
import { Modal, type ModalProps } from './Modal';

// The trigger owns `open`; Modal is controlled. `open` and `onClose` from the
// controls are overridden.
function Demo({
    label,
    ...props
}: Omit<ModalProps, 'open' | 'onClose'> &
    Partial<Pick<ModalProps, 'open' | 'onClose'>> & { label: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                {label}
            </Button>
            <Modal {...props} open={open} onClose={() => setOpen(false)} />
        </>
    );
}

const meta = {
    title: 'Components/Modal',
    component: Modal,
    tags: ['autodocs'],
    args: { open: false, onClose: () => {}, title: 'Weekly goal' },
    // Owned by the story's Demo, or React nodes: a control would do nothing.
    argTypes: {
        open: { table: { disable: true } },
        onClose: { table: { disable: true } },
        children: { table: { disable: true } },
        icon: { table: { disable: true } },
        actions: { table: { disable: true } },
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Modal>;
export default meta;

type Story = StoryObj<typeof meta>;

const TrashIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
);

const CheckIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
);

/** Destructive action: `alertdialog`, focus starts on the safe button. */
export const Confirm: Story = {
    args: {
        role: 'alertdialog',
        size: 'sm',
        icon: <TrashIcon />,
        status: 'error',
        title: 'Delete this workout?',
        description:
            "It will be removed from your history and weekly totals. This can't be undone.",
        actions: (
            <>
                <Button variant="secondary" data-autofocus>
                    Keep it
                </Button>
                <Button
                    variant="primary"
                    style={{
                        background: 'var(--tintora-color-destructive)',
                        color: 'var(--tintora-color-on-destructive)',
                    }}
                >
                    Delete
                </Button>
            </>
        ),
    },
    render: (args) => <Demo {...args} label="Delete workout" />,
};

/** Enter submits, Esc cancels; focus starts on the first field. */
export const Form: Story = {
    args: {
        title: 'Weekly goal',
        actions: (
            <>
                <Button variant="secondary">Cancel</Button>
                <Button variant="primary">Save goal</Button>
            </>
        ),
    },
    render: (args) => (
        <Demo {...args} label="Edit goal">
            <TextField
                label="Steps per day"
                defaultValue="10,000"
                hint="Most people start between 6,000 and 10,000."
                data-autofocus
            />
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                }}
            >
                <div>
                    <div style={{ font: 'var(--tintora-font-button)' }}>
                        Remind me on Sunday
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--tintora-text-faint)',
                        }}
                    >
                        A weekly nudge at 9:00
                    </div>
                </div>
                <Switch aria-label="Remind me on Sunday" defaultChecked />
            </div>
        </Demo>
    ),
};

/** One primary action and one quiet one, centred. */
export const Result: Story = {
    args: {
        align: 'center',
        size: 'sm',
        closeButton: false,
        icon: <CheckIcon />,
        status: 'success',
        title: 'Workout saved',
        description: '42 minutes, 312 kcal. Your weekly ring is at 80%.',
        actions: (
            <>
                <Button variant="primary" size="large" data-autofocus>
                    Back to dashboard
                </Button>
                <Button variant="ghost">View details</Button>
            </>
        ),
    },
    render: (args) => <Demo {...args} label="Finish workout" />,
};

export const Sizes: Story = {
    // Each trigger asks for its own size.
    argTypes: { size: { table: { disable: true } } },
    args: {
        description: 'Max width 400, 520 or 640; narrower viewports shrink it.',
    },
    render: (args) => (
        <div style={{ display: 'flex', gap: 12 }}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
                <Demo
                    {...args}
                    key={size}
                    label={size}
                    size={size}
                    title={`Size ${size}`}
                />
            ))}
        </div>
    ),
};
