import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Link } from './Link';

const meta = {
    title: 'Components/Link',
    component: Link,
    tags: ['autodocs'],
    args: { href: '#', children: 'View your activity' },
} satisfies Meta<typeof Link>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Inherits the surrounding font, so it sits in a sentence. */
export const InText: Story = {
    render: (args) => (
        <p
            style={{
                maxWidth: 420,
                margin: 0,
                font: 'var(--tintora-font-body)',
            }}
        >
            Your plan renews on 3 March. Read the{' '}
            <Link {...args}>billing terms</Link> before you change it.
        </p>
    ),
};

/** White, for dark or coloured surfaces. */
export const White: Story = {
    args: { variant: 'white' },
    decorators: [
        (Story) => (
            <div style={{ padding: 16, background: '#1d1c1c' }}>
                <Story />
            </div>
        ),
    ],
};

/** No style of its own: wraps a card or block and the content keeps its look. */
export const Transparent: Story = {
    args: { variant: 'transparent' },
    render: (args) => (
        <div style={{ width: 280 }}>
            <Link {...args}>
                <div
                    style={{
                        padding: 16,
                        borderRadius: 12,
                        border: '1px solid var(--tintora-line-strong)',
                        color: 'var(--tintora-text)',
                    }}
                >
                    <strong>Weekly summary</strong>
                    <div>The whole card is the link.</div>
                </div>
            </Link>
        </div>
    ),
};

export const External: Story = {
    args: {
        href: 'https://example.com',
        target: '_blank',
        rel: 'noopener noreferrer',
        children: 'Open the help centre',
    },
};

// Stands in for a router link such as Next's `Link`: it takes `href` and
// `className` and handles navigation itself.
function RouterLink({
    href,
    className,
    children,
}: {
    href: string;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <a
            href={href}
            className={className}
            onClick={(event) => {
                event.preventDefault();
                console.log(`Client-side navigation to ${href}`);
            }}
        >
            {children}
        </a>
    );
}

/**
 * `as` renders any component that accepts `className` and `children`, so a
 * router link keeps its client-side navigation. With Next.js:
 * `<Link as={NextLink} href="/profile">`.
 */
export const AsRouterLink: Story = {
    render: () => (
        <Link as={RouterLink} href="/profile">
            Go to your profile
        </Link>
    ),
};
