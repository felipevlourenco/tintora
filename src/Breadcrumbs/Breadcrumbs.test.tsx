import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';

const longTrail: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Home and living', href: '/shop/living' },
    { label: 'Lighting', href: '/shop/living/lighting' },
    { label: 'Alder desk lamp' },
];
const labels = () =>
    screen
        .getAllByRole('listitem')
        .map((li) => li.textContent?.replace(/[/›]/g, '').trim());

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

    describe('props', () => {
        it('does not leak separator or linkAs to the nav element', () => {
            render(
                <Breadcrumbs items={items} separator="›" linkAs={RouterLink} />,
            );
            const nav = screen.getByRole('navigation');
            expect(nav).not.toHaveAttribute('separator');
            expect(nav).not.toHaveAttribute('linkas');
        });
    });

    describe('link style', () => {
        it('uses the transparent Link variant, so the trail sets its own colours', () => {
            render(<Breadcrumbs items={items} />);
            for (const link of screen.getAllByRole('link')) {
                expect(link).toHaveClass(
                    'tintora-link',
                    'tintora-link--transparent',
                );
                expect(link.className.split(' ')).toEqual([
                    ...new Set(link.className.split(' ')),
                ]);
            }
        });
    });

    describe('maxItems', () => {
        const expand = () =>
            screen.getByRole('button', { name: 'Show full path' });

        it('shows every crumb without it', () => {
            render(<Breadcrumbs items={longTrail} />);
            expect(screen.getAllByRole('listitem')).toHaveLength(5);
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('shows every crumb when the trail is not longer than the limit', () => {
            render(<Breadcrumbs items={longTrail} maxItems={5} />);
            expect(screen.getAllByRole('listitem')).toHaveLength(5);
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('keeps the first crumb and the last ones, with a button between', () => {
            render(<Breadcrumbs items={longTrail} maxItems={3} />);
            expect(labels()).toEqual([
                'Home',
                '…',
                'Lighting',
                'Alder desk lamp',
            ]);
            expect(screen.queryByText('Shop')).toBeNull();
            expect(screen.queryByText('Home and living')).toBeNull();
        });

        it('treats a limit below 2 as 2: the first and the last crumb', () => {
            render(<Breadcrumbs items={longTrail} maxItems={1} />);
            expect(labels()).toEqual(['Home', '…', 'Alder desk lamp']);
        });

        it('keeps the last crumb as the current page', () => {
            render(<Breadcrumbs items={longTrail} maxItems={3} />);
            expect(screen.getByText('Alder desk lamp')).toHaveAttribute(
                'aria-current',
                'page',
            );
        });

        it('draws a separator after every visible crumb but the last', () => {
            const { container } = render(
                <Breadcrumbs items={longTrail} maxItems={3} />,
            );
            expect(
                container.querySelectorAll('.tintora-breadcrumbs__separator'),
            ).toHaveLength(3);
        });

        it('names the button, and takes a translated name', () => {
            const { unmount } = render(
                <Breadcrumbs items={longTrail} maxItems={3} />,
            );
            expect(expand()).toHaveAttribute('type', 'button');
            unmount();
            render(
                <Breadcrumbs
                    items={longTrail}
                    maxItems={3}
                    expandLabel="Chemin complet"
                />,
            );
            expect(
                screen.getByRole('button', { name: 'Chemin complet' }),
            ).toBeInTheDocument();
        });

        it('shows the whole trail on click, and the button goes away', async () => {
            render(<Breadcrumbs items={longTrail} maxItems={3} />);
            await userEvent.click(expand());
            expect(labels()).toEqual([
                'Home',
                'Shop',
                'Home and living',
                'Lighting',
                'Alder desk lamp',
            ]);
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('moves focus to the first revealed crumb, so it is not lost', async () => {
            render(<Breadcrumbs items={longTrail} maxItems={3} />);
            await userEvent.click(expand());
            expect(screen.getByRole('link', { name: 'Shop' })).toHaveFocus();
        });

        it('works from the keyboard', async () => {
            render(<Breadcrumbs items={longTrail} maxItems={3} />);
            await userEvent.tab();
            await userEvent.tab();
            expect(expand()).toHaveFocus();
            await userEvent.keyboard('{Enter}');
            expect(screen.getByRole('link', { name: 'Shop' })).toHaveFocus();
        });

        it('does not leak maxItems or expandLabel to the nav element', () => {
            render(
                <Breadcrumbs
                    items={longTrail}
                    maxItems={3}
                    expandLabel="Chemin"
                />,
            );
            const nav = screen.getByRole('navigation');
            expect(nav).not.toHaveAttribute('maxitems');
            expect(nav).not.toHaveAttribute('expandlabel');
        });

        it('has no accessibility violations when collapsed', async () => {
            const { container } = render(
                <Breadcrumbs items={longTrail} maxItems={3} />,
            );
            await expectNoA11yViolations(container);
        });
    });

    describe('linkAs', () => {
        it('renders the links as the given component', () => {
            render(<Breadcrumbs items={items} linkAs={RouterLink} />);
            const links = screen.getAllByRole('link');
            expect(links).toHaveLength(3);
            for (const link of links) {
                expect(link).toHaveAttribute('data-router');
                expect(link).toHaveClass(
                    'tintora-link',
                    'tintora-link--transparent',
                );
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
