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

const Grid = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
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

const row = {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexWrap: 'wrap',
} as const;

export const Round: Story = { args: { variant: 'round' } };

export const Field: Story = { args: { variant: 'field' } };

export const Nav: Story = {
    args: { variant: 'nav', icon: <Grid />, 'aria-label': 'Dashboard' },
};

export const NavSelected: Story = {
    args: { ...Nav.args, selected: true } as Story['args'],
};

const roundSizes = ['small', 'medium', 'large'] as const;

export const RoundSizes: Story = {
    render: (args) => (
        <div style={row}>
            {roundSizes.map((size) => (
                <IconButton
                    key={size}
                    icon={args.icon}
                    variant="round"
                    size={size}
                    aria-label={`${size} notifications`}
                />
            ))}
        </div>
    ),
};

export const Disabled: Story = {
    render: (args) => (
        <div style={row}>
            <IconButton
                icon={args.icon}
                aria-label="Notifications"
                variant="round"
                disabled
            />
            <IconButton
                icon={args.icon}
                aria-label="Notifications"
                variant="field"
                disabled
            />
            <IconButton
                variant="nav"
                icon={<Grid />}
                aria-label="Dashboard"
                disabled
            />
        </div>
    ),
};

/** Every variant in every state, like the design. Nav shows "Selected" in place of "Pressed". */
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
        <div style={{ display: 'grid', gap: 16 }}>
            {(['round', 'field'] as const).map((variant) => (
                <div key={variant} style={row}>
                    {states.map(({ label, className, disabled }) => (
                        <IconButton
                            key={label}
                            icon={args.icon}
                            variant={variant}
                            className={className}
                            disabled={disabled}
                            aria-label={`${variant} ${label}`}
                        />
                    ))}
                </div>
            ))}
            <div style={row}>
                {states.map(({ label, className, disabled }) => (
                    <IconButton
                        key={label}
                        variant="nav"
                        icon={<Grid />}
                        className={label === 'Pressed' ? undefined : className}
                        selected={label === 'Pressed'}
                        disabled={disabled}
                        aria-label={`nav ${label === 'Pressed' ? 'Selected' : label}`}
                    />
                ))}
            </div>
        </div>
    ),
};
