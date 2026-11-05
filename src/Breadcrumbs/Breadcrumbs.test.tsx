import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Lighting', href: '/shop/lighting' },
    { label: 'Alder desk lamp' },
];

// Stands in for a router link: it gets `href`, `className` and `children`.
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
        <a href={href} className={className} data-router="">
            {children}
        </a>
    );
}

describe('Breadcrumbs', () => {
    describe('landmark', () => {
        it('is a navigation named Breadcrumb', () => {
            render(<Breadcrumbs items={items} />);
            expect(
                screen.getByRole('navigation', { name: 'Breadcrumb' }),
            ).toHaveClass('tintora-breadcrumbs');
        });

        it('takes a translated name', () => {
            render(<Breadcrumbs items={items} aria-label="Fil d'Ariane" />);
            expect(
                screen.getByRole('navigation', { name: "Fil d'Ariane" }),
            ).toBeInTheDocument();
        });

        it('keeps the consumer className and passes attributes through', () => {
            render(<Breadcrumbs items={items} className="custom" id="trail" />);
            const nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('tintora-breadcrumbs', 'custom');
            expect(nav).toHaveAttribute('id', 'trail');
        });

        it('renders nothing for an empty trail', () => {
            const { container } = render(<Breadcrumbs items={[]} />);
            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('items', () => {
        it('lists one item per crumb, in order', () => {
            render(<Breadcrumbs items={items} />);
            const list = screen.getByRole('list');
            expect(list.tagName).toBe('OL');
            expect(
                within(list)
                    .getAllByRole('listitem')
                    .map((li) => li.textContent?.replace('/', '').trim()),
            ).toEqual(['Home', 'Shop', 'Lighting', 'Alder desk lamp']);
        });

        it('links every crumb but the last', () => {
            render(<Breadcrumbs items={items} />);
            const links = screen.getAllByRole('link');
            expect(links.map((a) => a.getAttribute('href'))).toEqual([
                '/',
                '/shop',
                '/shop/lighting',
            ]);
            expect(links[0]).toHaveClass('tintora-link');
        });

        it('marks the last crumb as the current page, and only that one', () => {
            render(<Breadcrumbs items={items} />);
            const current = screen.getByText('Alder desk lamp');
            expect(current).toHaveAttribute('aria-current', 'page');
            expect(
                screen.queryByRole('link', { name: 'Alder desk lamp' }),
            ).toBeNull();
            expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
        });

        it('does not link the last crumb even when it has an href', () => {
            render(
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Shop', href: '/shop' },
                    ]}
                />,
            );
            expect(screen.getAllByRole('link')).toHaveLength(1);
            expect(screen.getByText('Shop')).toHaveAttribute(
                'aria-current',
                'page',
            );
        });

        it('renders a middle crumb without an href as plain text', () => {
            render(
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Archive' },
                        { label: 'Item' },
                    ]}
                />,
            );
            expect(screen.getByText('Archive')).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: 'Archive' })).toBeNull();
        });

        it('shows a single crumb as the current page', () => {
            render(<Breadcrumbs items={[{ label: 'Home' }]} />);
            expect(screen.getByText('Home')).toHaveAttribute(
                'aria-current',
                'page',
            );
            expect(screen.queryByRole('link')).toBeNull();
        });
    });

    describe('separator', () => {
        const separators = (container: HTMLElement) =>
            container.querySelectorAll('.tintora-breadcrumbs__separator');

        it('sits between crumbs: one fewer than the items', () => {
            const { container } = render(<Breadcrumbs items={items} />);
            expect(separators(container)).toHaveLength(3);
        });

        it('has none for a single crumb', () => {
            const { container } = render(
                <Breadcrumbs items={[{ label: 'Home' }]} />,
            );
            expect(separators(container)).toHaveLength(0);
        });

        it('is a slash by default and hidden from assistive tech', () => {
            const { container } = render(<Breadcrumbs items={items} />);
            for (const separator of separators(container)) {
                expect(separator).toHaveTextContent('/');
                expect(separator).toHaveAttribute('aria-hidden', 'true');
            }
        });

        it('takes a custom separator', () => {
            const { container } = render(
                <Breadcrumbs items={items} separator="›" />,
            );
            expect(separators(container)[0]).toHaveTextContent('›');
        });
    });

    describe('linkAs', () => {
        it('renders the links as the given component', () => {
            render(<Breadcrumbs items={items} linkAs={RouterLink} />);
            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(3);
            for (const link of links) {
                expect(link).toHaveAttribute('data-router');
                expect(link).toHaveClass('tintora-link');
            }
            expect(links[1]).toHaveAttribute('href', '/shop');
        });
    });

    describe('accessibility', () => {
        it('has no violations', async () => {
            const { container } = render(<Breadcrumbs items={items} />);
            await expectNoA11yViolations(container);
        });
    });
});
