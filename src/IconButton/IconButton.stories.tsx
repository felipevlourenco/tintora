import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconButton } from './IconButton';

const Bell = () => (
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
);

const meta = {
    title: 'Components/IconButton',
    component: IconButton,
    tags: ['autodocs'],
    args: { icon: <Bell />, 'aria-label': 'Notifications' },
} satisfies Meta<typeof IconButton>;
export default meta;

type Story = StoryObj<typeof meta>;

const sizes = ['small', 'medium', 'large'] as const;
const row = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
} as const;

export const Round: Story = { args: { variant: 'round' } };

export const Sizes: Story = {
    render: (args) => (
        <div style={row}>
            {sizes.map((size) => (
                <IconButton
                    key={size}
                    {...args}
                    size={size}
                    aria-label={`${size} notifications`}
                />
            ))}
        </div>
    ),
};

export const Disabled: Story = { args: { disabled: true } };

/** Every state, like the design. Hover, pressed and focus are forced. */
const states = [
    { label: 'Default' },
    { label: 'Hover', className: 'is-hover' },
    { label: 'Pressed', className: 'is-active' },
    { label: 'Focus', className: 'is-focus' },
    { label: 'Disabled', disabled: true },
];

export const States: Story = {
    parameters: {
        pseudo: {
            hover: '.is-hover, .is-active',
            active: '.is-active',
            focusVisible: '.is-focus',
        },
    },
    render: (args) => (
        <div style={row}>
            {states.map(({ label, className, disabled }) => (
                <IconButton
                    key={label}
                    {...args}
                    className={className}
                    disabled={disabled}
                    aria-label={`${label} notifications`}
                />
            ))}
        </div>
    ),
};
