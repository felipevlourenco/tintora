import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Menu } from './Menu';
import { MenuItem, MenuSeparator } from './MenuItem';

const stroke = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
} as const;
const Pencil = () => (
    <svg {...stroke}>
        <path d="M4 20h4L19 9l-4-4L4 16z" />
    </svg>
);
const Copy = () => (
    <svg {...stroke}>
        <rect x="9" y="9" width="11" height="11" rx="2" />
        <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
);
const Trash = () => (
    <svg {...stroke}>
        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
);
const Dots = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="1.8" />
        <circle cx="12" cy="12" r="1.8" />
        <circle cx="19" cy="12" r="1.8" />
    </svg>
);

const meta = {
    title: 'Components/Menu',
    component: Menu,
    tags: ['autodocs'],
    args: {
        'aria-label': 'Order actions',
        trigger: <Button variant="secondary">Actions</Button>,
        children: null,
    },
    // Without a render function, Storybook passes no children.
    render: (args) => (
        <Menu {...args}>
            <MenuItem icon={<Pencil />}>Edit</MenuItem>
            <MenuItem icon={<Copy />}>Duplicate</MenuItem>
            <MenuItem disabled>Archive</MenuItem>
            <MenuSeparator />
            <MenuItem icon={<Trash />} destructive>
                Delete
            </MenuItem>
        </Menu>
    ),
} satisfies Meta<typeof Menu>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Arrow keys, Home and End move between items; Esc closes. */
export const Default: Story = {};

/** An `IconButton` trigger, the usual "more" button on a row. */
export const IconTrigger: Story = {
    args: {
        trigger: <IconButton aria-label="More actions" icon={<Dots />} />,
    },
};

/** `align="end"` lines the menu up with the trigger's right edge. */
export const AlignedToTheEnd: Story = {
    args: { align: 'end' },
    decorators: [
        (Story) => (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Story />
            </div>
        ),
    ],
};

function SelectDemo() {
    const [last, setLast] = useState('nothing yet');
    return (
        <div style={{ display: 'grid', gap: 12 }}>
            <Menu
                aria-label="Order actions"
                trigger={<Button variant="secondary">Actions</Button>}
            >
                {['Edit', 'Duplicate', 'Archive'].map((name) => (
                    <MenuItem key={name} onSelect={() => setLast(name)}>
                        {name}
                    </MenuItem>
                ))}
            </Menu>
            <span style={{ font: 'var(--tintora-font-body)' }}>
                You chose: {last}
            </span>
        </div>
    );
}

/** `onSelect` runs when an item is chosen; the menu then closes. */
export const OnSelect: Story = { render: () => <SelectDemo /> };
