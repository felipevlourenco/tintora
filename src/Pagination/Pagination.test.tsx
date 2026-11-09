import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Pagination, type PaginationProps } from './Pagination';

const setup = (props: Partial<PaginationProps> = {}) =>
    render(<Pagination page={1} pageCount={5} {...props} />);

// The visible page numbers and ellipses, in order.
const shown = () =>
    screen
        .getAllByRole('listitem', { hidden: true })
        .slice(1, -1)
        .map((li) => li.textContent);

const page = (n: number) => screen.getByRole('button', { name: `Page ${n}` });

function RouterLink({
    href,
    className,
    children,
    ...rest
}: {
    href: string;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <a href={href} className={className} data-router="" {...rest}>
            {children}
        </a>
    );
}

describe('Pagination', () => {
    describe('landmark', () => {
        it('is a navigation named Pagination', () => {
            setup();
            expect(
                screen.getByRole('navigation', { name: 'Pagination' }),
            ).toHaveClass('tintora-pagination');
        });

        it('takes a translated name', () => {
            setup({ 'aria-label': 'Pages' });
            expect(
                screen.getByRole('navigation', { name: 'Pages' }),
            ).toBeInTheDocument();
        });

        it('keeps the consumer className and passes attributes through', () => {
            setup({ className: 'custom', id: 'pager' });
            const nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('tintora-pagination', 'custom');
            expect(nav).toHaveAttribute('id', 'pager');
        });

        it('renders nothing without pages', () => {
            const { container } = setup({ pageCount: 0 });
            expect(container).toBeEmptyDOMElement();
        });

        it('does not leak its props to the nav element', () => {
            setup({ onPageChange: () => {}, siblingCount: 2 });
            const nav = screen.getByRole('navigation');
            for (const name of [
                'page',
                'pagecount',
                'onpagechange',
                'siblingcount',
            ]) {
                expect(nav).not.toHaveAttribute(name);
            }
        });
    });

    describe('pages shown', () => {
        it('shows every page when they fit', () => {
            setup({ pageCount: 7 });
            expect(shown()).toEqual(['1', '2', '3', '4', '5', '6', '7']);
        });

        it('collapses the end of a long list', () => {
            setup({ page: 1, pageCount: 20 });
            expect(shown()).toEqual(['1', '2', '3', '4', '5', '…', '20']);
        });

        it('collapses the start of a long list', () => {
            setup({ page: 20, pageCount: 20 });
            expect(shown()).toEqual(['1', '…', '16', '17', '18', '19', '20']);
        });

        it('collapses both sides in the middle', () => {
            setup({ page: 10, pageCount: 20 });
            expect(shown()).toEqual(['1', '…', '9', '10', '11', '…', '20']);
        });

        it('shows the same number of slots wherever the page is', () => {
            for (const p of [1, 3, 4, 10, 17, 18, 20]) {
                const { unmount } = setup({ page: p, pageCount: 20 });
                expect(shown()).toHaveLength(7);
                unmount();
            }
        });

        it('takes more siblings', () => {
            setup({ page: 10, pageCount: 30, siblingCount: 2 });
            expect(shown()).toEqual([
                '1',
                '…',
                '8',
                '9',
                '10',
                '11',
                '12',
                '…',
                '30',
            ]);
        });

        it('hides the ellipsis from assistive tech', () => {
            setup({ page: 10, pageCount: 20 });
            const dots = screen
                .getAllByRole('listitem', { hidden: true })
                .filter((li) => li.textContent === '…');
            for (const li of dots) {
                expect(li).toHaveAttribute('aria-hidden', 'true');
            }
        });

        it('clamps a page outside the range', () => {
            setup({ page: 99, pageCount: 5 });
            expect(page(5)).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('current page', () => {
        it('is aria-current="page", and only that one', () => {
            setup({ page: 3 });
            expect(page(3)).toHaveAttribute('aria-current', 'page');
            expect(page(2)).not.toHaveAttribute('aria-current');
            expect(document.querySelectorAll('[aria-current]')).toHaveLength(1);
            expect(page(3)).toHaveClass('tintora-pagination__control--current');
        });
    });

    describe('previous and next', () => {
        it('disables previous on the first page', () => {
            setup({ page: 1 });
            expect(
                screen.getByRole('button', { name: 'Previous page' }),
            ).toBeDisabled();
            expect(
                screen.getByRole('button', { name: 'Next page' }),
            ).toBeEnabled();
        });

        it('disables next on the last page', () => {
            setup({ page: 5 });
            expect(
                screen.getByRole('button', { name: 'Next page' }),
            ).toBeDisabled();
        });

        it('takes translated names', () => {
            setup({
                page: 2,
                previousLabel: 'Précédent',
                nextLabel: 'Suivant',
                pageLabel: (n) => `Page ${n} sur 5`,
            });
            expect(
                screen.getByRole('button', { name: 'Précédent' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Suivant' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Page 3 sur 5' }),
            ).toBeInTheDocument();
        });
    });

    describe('buttons', () => {
        it('are plain buttons', () => {
            setup();
            for (const button of screen.getAllByRole('button')) {
                expect(button).toHaveAttribute('type', 'button');
            }
        });

        it('call onPageChange with the clicked page', async () => {
            const onPageChange = vi.fn();
            setup({ page: 2, onPageChange });
            await userEvent.click(page(4));
            expect(onPageChange).toHaveBeenCalledExactlyOnceWith(4);
        });

        it('call it with page - 1 and page + 1 from the edges', async () => {
            const onPageChange = vi.fn();
            setup({ page: 3, onPageChange });
            await userEvent.click(
                screen.getByRole('button', { name: 'Previous page' }),
            );
            expect(onPageChange).toHaveBeenLastCalledWith(2);
            await userEvent.click(
                screen.getByRole('button', { name: 'Next page' }),
            );
            expect(onPageChange).toHaveBeenLastCalledWith(4);
        });

        it('are reachable and work from the keyboard', async () => {
            const onPageChange = vi.fn();
            setup({ page: 1, onPageChange });
            await userEvent.tab();
            expect(page(1)).toHaveFocus();
            await userEvent.keyboard('{Tab}{Enter}');
            expect(onPageChange).toHaveBeenCalledWith(2);
        });
    });

    describe('links', () => {
        const getHref = (n: number) => `/shop?page=${n}`;

        it('render the pages as links to getHref', () => {
            setup({ page: 2, getHref });
            expect(
                screen.getByRole('link', { name: 'Page 3' }),
            ).toHaveAttribute('href', '/shop?page=3');
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('mark the current page and link previous and next', () => {
            setup({ page: 2, getHref });
            expect(
                screen.getByRole('link', { name: 'Page 2' }),
            ).toHaveAttribute('aria-current', 'page');
            expect(
                screen.getByRole('link', { name: 'Previous page' }),
            ).toHaveAttribute('href', '/shop?page=1');
            expect(
                screen.getByRole('link', { name: 'Next page' }),
            ).toHaveAttribute('href', '/shop?page=3');
        });

        it('turn previous into a disabled stand-in on the first page', () => {
            setup({ page: 1, getHref });
            const previous = screen.getByRole('link', {
                name: 'Previous page',
            });
            expect(previous).toHaveAttribute('aria-disabled', 'true');
            expect(previous).not.toHaveAttribute('href');
        });

        it('render through linkAs', () => {
            setup({ page: 2, getHref, linkAs: RouterLink });
            for (const link of screen
                .getAllByRole('link')
                .filter((l) => l.hasAttribute('href'))) {
                expect(link).toHaveAttribute('data-router');
            }
        });
    });

    describe('accessibility', () => {
        it('has no violations with buttons', async () => {
            const { container } = setup({ page: 10, pageCount: 20 });
            await expectNoA11yViolations(container);
        });

        it('has no violations with links', async () => {
            const { container } = setup({
                page: 1,
                pageCount: 20,
                getHref: (n) => `/p/${n}`,
            });
            await expectNoA11yViolations(container);
        });
    });
});
