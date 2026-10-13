import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from '../IconButton/IconButton';
import { Dot } from './Dot';

const meta = {
    title: 'Components/Dot',
    component: Dot,
    tags: ['autodocs'],
    args: { variant: 'unread' },
} satisfies Meta<typeof Dot>;
export default meta;

type Story = StoryObj<typeof meta>;

const row = { display: 'flex', alignItems: 'center', gap: 12 } as const;
const caption = {
    font: 'var(--tintora-font-caption)',
    color: 'var(--tintora-text-faint)',
} as const;

export const Default: Story = {};

export const Variants: Story = {
    render: () => (
        <div style={row}>
            <Dot variant="unread" />
            <span style={caption}>Unread</span>
            <Dot variant="read" />
            <span style={caption}>Read</span>
            <Dot variant="tick" />
            <span style={caption}>Section tick</span>
        </div>
    ),
};

/** With a label, the dot is announced as an image with that name. */
export const WithLabel: Story = { args: { label: 'Unread' } };

/** On a button the button's own name already says "unread", so the dot stays decorative. */
export const NotificationBadge: Story = {
    render: () => (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <IconButton
                variant="field"
                aria-label="Notifications, with unread dot"
                icon={
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" />
                        <path d="M10 21h4" />
                    </svg>
                }
            />
            <Dot style={{ position: 'absolute', top: 12, right: 13 }} />
        </div>
    ),
};
