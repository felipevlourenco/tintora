import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Link } from './Link';

// Stands in for a router link (Next's `Link`, React Router's `Link`): its own
// `to` prop, and it renders the `className` it is given.
function RouterLink({
    to,
    className,
    children,
}: {
    to: string;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <a href={to} className={className} data-router="">
            {children}
        </a>
    );
}

describe('Link', () => {
    it('renders an anchor with the Tintora class', () => {
        render(<Link href="/profile">Profile</Link>);
        const link = screen.getByRole('link', { name: 'Profile' });
        expect(link).toHaveAttribute('href', '/profile');
        expect(link).toHaveClass('tintora-link');
    });

    it('keeps the consumer className next to its own', () => {
        render(
            <Link href="/" className="custom">
                Home
            </Link>,
        );
        expect(screen.getByRole('link')).toHaveClass('tintora-link', 'custom');
    });

    it('passes anchor props through', async () => {
        const onClick = vi.fn((event) => event.preventDefault());
        render(
            <Link
                href="https://example.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Example site"
                onClick={onClick}
            >
                Example
            </Link>,
        );
        const link = screen.getByRole('link', { name: 'Example site' });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        await userEvent.click(link);
        expect(onClick).toHaveBeenCalledOnce();
    });

    it.each(['accent', 'white', 'transparent'] as const)(
        'applies the %s variant class without leaking the prop to the DOM',
        (variant) => {
            render(
                <Link href="/" variant={variant}>
                    Home
                </Link>,
            );
            const link = screen.getByRole('link');
            expect(link).toHaveClass(`tintora-link--${variant}`);
            expect(link).not.toHaveAttribute('variant');
        },
    );

    it('defaults to the accent variant', () => {
        render(<Link href="/">Home</Link>);
        expect(screen.getByRole('link')).toHaveClass('tintora-link--accent');
    });

    describe('as', () => {
        it('renders the given component with its own props and the class', () => {
            render(
                <Link as={RouterLink} to="/settings" className="custom">
                    Settings
                </Link>,
            );
            const link = screen.getByRole('link', { name: 'Settings' });
            expect(link).toHaveAttribute('data-router');
            expect(link).toHaveAttribute('href', '/settings');
            expect(link).toHaveClass('tintora-link', 'custom');
        });

        it('renders the given element', () => {
            render(
                <Link as="button" type="button">
                    Undo
                </Link>,
            );
            expect(screen.getByRole('button', { name: 'Undo' })).toHaveClass(
                'tintora-link',
            );
        });

        it('type-checks the props of the given component', () => {
            // @ts-expect-error `to` is required by RouterLink
            render(<Link as={RouterLink}>Missing destination</Link>);
        });
    });

    it('has no accessibility violations', async () => {
        const { container } = render(
            <p>
                Read the <Link href="/terms">terms</Link> first.
            </p>,
        );
        await expectNoA11yViolations(container);
    });
});
