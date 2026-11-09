import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Table, type TableProps } from './Table';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Table.css'), 'utf8');

const rows = (
    <>
        <thead>
            <tr>
                <th scope="col">Order</th>
                <th scope="col" data-align="end">
                    Total
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">#1042</th>
                <td data-align="end">$54.00</td>
            </tr>
        </tbody>
    </>
);

const setup = (props: Partial<TableProps> = {}) =>
    render(<Table {...props}>{rows}</Table>);

describe('Table', () => {
    describe('structure', () => {
        it('renders a native table with the Tintora class, and its children', () => {
            setup();
            const table = screen.getByRole('table');
            expect(table).toHaveClass('tintora-table');
            expect(
                screen.getByRole('columnheader', { name: 'Order' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('rowheader', { name: '#1042' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('cell', { name: '$54.00' }),
            ).toHaveAttribute('data-align', 'end');
        });

        it('keeps the consumer className and passes attributes through', () => {
            setup({ className: 'custom', id: 'orders' });
            const table = screen.getByRole('table');
            expect(table).toHaveClass('tintora-table', 'custom');
            expect(table).toHaveAttribute('id', 'orders');
        });

        it('wraps the table in a scroll box', () => {
            const { container } = setup();
            expect(container.firstChild).toHaveClass('tintora-table-scroll');
            expect(container.firstChild).toContainElement(
                screen.getByRole('table'),
            );
        });
    });

    describe('caption', () => {
        it('names the table', () => {
            setup({ caption: 'Recent orders' });
            expect(
                screen.getByRole('table', { name: 'Recent orders' }),
            ).toBeInTheDocument();
        });

        it('has no caption without one', () => {
            const { container } = setup();
            expect(container.querySelector('caption')).toBeNull();
        });

        it('can hide the caption on screen and keep it for assistive tech', () => {
            setup({ caption: 'Recent orders', captionHidden: true });
            expect(screen.getByText('Recent orders')).toHaveClass(
                'tintora-table__caption--hidden',
            );
            expect(
                screen.getByRole('table', { name: 'Recent orders' }),
            ).toBeInTheDocument();
        });
    });

    describe('density', () => {
        it('is comfortable by default, and can be compact', () => {
            const { unmount } = setup();
            expect(screen.getByRole('table')).toHaveClass(
                'tintora-table--comfortable',
            );
            unmount();
            setup({ density: 'compact' });
            expect(screen.getByRole('table')).toHaveClass(
                'tintora-table--compact',
            );
        });
    });

    describe('scroll region', () => {
        it('is a plain box without scrollLabel', () => {
            const { container } = setup();
            expect(container.firstChild).not.toHaveAttribute('tabindex');
            expect(screen.queryByRole('region')).toBeNull();
        });

        it('becomes a labelled, focusable region with scrollLabel', () => {
            setup({ scrollLabel: 'Orders, scrollable' });
            const region = screen.getByRole('region', {
                name: 'Orders, scrollable',
            });
            expect(region).toHaveAttribute('tabindex', '0');
            expect(region).toContainElement(screen.getByRole('table'));
        });

        it('does not leak its props to the table element', () => {
            setup({
                scrollLabel: 'x',
                density: 'compact',
                captionHidden: true,
            });
            const table = screen.getByRole('table');
            for (const name of ['scrolllabel', 'density', 'captionhidden']) {
                expect(table).not.toHaveAttribute(name);
            }
        });
    });

    describe('stylesheet', () => {
        it('scrolls sideways inside its box', () => {
            expect(css).toMatch(
                /\.tintora-table-scroll\s*\{[^}]*overflow-x:\s*auto/,
            );
        });

        it('right-aligns data-align="end" cells with tabular digits', () => {
            expect(css).toMatch(
                /\[data-align='end'\]\s*\{[^}]*text-align:\s*end[^}]*tabular-nums/,
            );
        });

        it('styles the header apart from the body', () => {
            expect(css).toMatch(/\.tintora-table thead th\s*\{[^}]*uppercase/);
        });

        it('shows a focus ring on the scroll region', () => {
            expect(css).toMatch(
                /\.tintora-table-scroll:focus-visible\s*\{[^}]*outline/,
            );
        });
    });

    describe('accessibility', () => {
        it('has no violations', async () => {
            const { container } = setup({ caption: 'Recent orders' });
            await expectNoA11yViolations(container);
        });

        it('has no violations as a scroll region', async () => {
            const { container } = setup({ scrollLabel: 'Orders, scrollable' });
            await expectNoA11yViolations(container);
        });
    });
});
