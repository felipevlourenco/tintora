import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { Breadcrumbs } from './Breadcrumbs';

const Chevron = () => (
    <svg
        viewBox="0 0 24 24"
        width="12"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m9 6 6 6-6 6" />
    </svg>
);

// Stands in for a router link (Next's `Link`, React Router's `Link`).
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
                console.log('client-side navigation to', href);
            }}
        >
            {children}
        </a>
    );
}

const meta = {
    title: 'Components/Breadcrumbs',
    component: Breadcrumbs,
    tags: ['autodocs'],
    args: {
        items: [
            { label: 'Home', href: '#home' },
            { label: 'Shop', href: '#shop' },
            { label: 'Lighting', href: '#lighting' },
            { label: 'Alder desk lamp' },
        ],
    },
} satisfies Meta<typeof Breadcrumbs>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A shop trail on the light page background, with chevrons. */
export const ShopTrail: Story = {
    args: {
        separator: <Chevron />,
        items: [
            { label: 'Shop all', href: '#shop' },
            { label: 'Lighting', href: '#lighting' },
            { label: 'Alder desk lamp' },
        ],
    },
    decorators: [
        (Story) => (
            <div
                data-theme="light"
                style={{
                    padding: '20px 24px',
                    background: 'var(--tintora-bg)',
                    fontFamily: 'var(--tintora-font-family)',
                    fontSize: 18,
                    fontWeight: 500,
                }}
            >
                <Story />
            </div>
        ),
    ],
};

export const TwoLevels: Story = {
    args: {
        items: [{ label: 'Home', href: '#home' }, { label: 'Settings' }],
    },
};

export const CustomSeparator: Story = {
    args: { separator: <Chevron /> },
};

/** A crumb without an `href` is plain text, such as a category with no page. */
export const CrumbWithoutLink: Story = {
    args: {
        items: [
            { label: 'Home', href: '#home' },
            { label: 'Archive' },
            { label: 'Alder desk lamp' },
        ],
    },
};

/** A long trail wraps onto the next line instead of overflowing. */
export const LongTrail: Story = {
    args: {
        items: [
            { label: 'Home', href: '#home' },
            { label: 'Shop', href: '#shop' },
            { label: 'Home and living', href: '#living' },
            { label: 'Lighting', href: '#lighting' },
            { label: 'Desk lamps', href: '#desk' },
            { label: 'Alder desk lamp in brushed brass' },
        ],
    },
    decorators: [
        (Story) => (
            <div style={{ width: 320 }}>
                <Story />
            </div>
        ),
    ],
};

/** Links are rendered by the router, so navigation stays client-side. */
export const AsRouterLink: Story = { args: { linkAs: RouterLink } };
