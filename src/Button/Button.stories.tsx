import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

const meta = {
    title: 'Components/Button',
    component: Button,
    tags: ['autodocs'],
    args: { children: 'Button', variant: 'primary', size: 'medium' },
} satisfies Meta<typeof Button>;
export default meta;

type Story = StoryObj<typeof meta>;

const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;
const sizes = ['small', 'medium', 'large'] as const;

const row = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
} as const;

const Plus = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 5v14M5 12h14" />
    </svg>
);
const Chevron = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M9 6l6 6-6 6" />
    </svg>
);

export const Default: Story = {};

export const Variants: Story = {
    render: (args) => (
        <div style={row}>
            {variants.map((variant) => (
                <Button key={variant} {...args} variant={variant}>
                    {variant}
                </Button>
            ))}
        </div>
    ),
};

export const Sizes: Story = {
    render: (args) => (
        <div style={row}>
            {sizes.map((size) => (
                <Button key={size} {...args} size={size}>
                    {size}
                </Button>
            ))}
        </div>
    ),
};

export const WithIcons: Story = {
    args: { variant: 'secondary' },
    render: (args) => (
        <div style={row}>
            <Button {...args} leadingIcon={<Plus />}>
                Leading icon
            </Button>
            <Button {...args} trailingIcon={<Chevron />}>
                Trailing icon
            </Button>
        </div>
    ),
};

export const Disabled: Story = {
    render: (args) => (
        <div style={row}>
            {variants.map((variant) => (
                <Button key={variant} {...args} variant={variant} disabled>
                    {variant}
                </Button>
            ))}
        </div>
    ),
};

/** Every variant in every state, like the design. Hover, pressed and focus are forced. */
const states = [
    { label: 'Default' },
    { label: 'Hover', className: 'is-hover' },
    { label: 'Pressed', className: 'is-active' },
    { label: 'Focus', className: 'is-focus' },
    { label: 'Disabled', disabled: true },
];

/**
 * `as` renders a real `<a>`, or a router's link such as Next's `Link`, with
 * the same hover, pressed and focus styles. With Next.js:
 * `<Button as={NextLink} href="/requests" variant="primary">`.
 */
export const AsLink: Story = {
    render: (args) => (
        <div style={row}>
            {variants.map((variant) => (
                <Button
                    key={variant}
                    {...args}
                    as="a"
                    href="#"
                    variant={variant}
                >
                    {variant}
                </Button>
            ))}
            <Button {...args} as="a" href="#" disabled>
                disabled
            </Button>
        </div>
    ),
};

export const Loading: Story = {
    render: (args) => (
        <div style={row}>
            {variants.map((variant) => (
                <Button key={variant} {...args} variant={variant} loading>
                    {variant}
                </Button>
            ))}
        </div>
    ),
};

export const FullWidth: Story = {
    render: (args) => (
        <div style={{ ...row, width: '100%' }}>
            <Button {...args} variant="primary" fullWidth>
                Primary
            </Button>
        </div>
    ),
};

export const States: Story = {
    parameters: {
        pseudo: {
            hover: '.is-hover, .is-active',
            active: '.is-active',
            focusVisible: '.is-focus',
        },
    },
    render: (args) => (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, auto)',
                gap: 16,
                alignItems: 'center',
            }}
        >
            {variants.flatMap((variant) =>
                states.map(({ label, className, disabled }) => (
                    <Button
                        key={`${variant}-${label}`}
                        {...args}
                        variant={variant}
                        className={className}
                        disabled={disabled}
                    >
                        {label}
                    </Button>
                )),
            )}
        </div>
    ),
};
