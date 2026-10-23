import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Drawer, type DrawerProps } from './Drawer';

// The trigger owns `open`; Drawer is controlled. `open` and `onClose` from the
// controls are overridden.
function Demo({
    label = 'Open drawer',
    paragraphs = 2,
    ...props
}: Partial<DrawerProps> & { label?: string; paragraphs?: number }) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    return (
        <>
            <Button variant="secondary" onClick={() => setOpen(true)}>
                {label}
            </Button>
            <Drawer {...props} open={open} onClose={close}>
                <h2 style={{ margin: 0 }}>Filters</h2>
                {Array.from({ length: paragraphs }, (_, i) => (
                    <p key={i}>
                        Pick the workouts, devices and date range to show. The
                        panel closes on a backdrop click or Esc.
                    </p>
                ))}
                <Button data-autofocus variant="secondary" onClick={close}>
                    Done
                </Button>
            </Drawer>
        </>
    );
}

const meta = {
    title: 'Components/Drawer',
    component: Drawer,
    tags: ['autodocs'],
    args: { open: false, onClose: () => {}, 'aria-label': 'Filters' },
    // Owned by the story's Demo, or React nodes: a control would do nothing.
    argTypes: {
        open: { table: { disable: true } },
        onClose: { table: { disable: true } },
        children: { table: { disable: true } },
    },
    render: (args) => <Demo {...args} />,
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Drawer>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Slides in from the right, 400px wide, full height. */
export const Right: Story = { args: { from: 'right' } };

/** Slides in from the left. */
export const Left: Story = { args: { from: 'left' } };

/** Slides down from the top, full width, as tall as its content. */
export const Top: Story = { args: { from: 'top' } };

/** Slides up from the bottom, full width, as tall as its content. */
export const Bottom: Story = { args: { from: 'bottom' } };

/** A string passes through, so `'50vw'` works. */
export const CustomWidth: Story = { args: { from: 'right', width: '50vw' } };

/** A bottom drawer with a fixed height. */
export const CustomHeight: Story = {
    args: { from: 'bottom', height: 320 },
};

/** Content taller than the drawer scrolls inside it. */
export const LongContent: Story = {
    args: { from: 'right' },
    render: (args) => <Demo {...args} paragraphs={40} />,
};
