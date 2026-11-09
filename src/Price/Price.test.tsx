import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Price, type PriceProps } from './Price';

const setup = (props: Partial<PriceProps> = {}) =>
    render(<Price value={54} data-testid="price" {...props} />);

describe('Price', () => {
    describe('format', () => {
        it('formats US dollars by default', () => {
            setup();
            expect(screen.getByText('$54.00')).toBeInTheDocument();
        });

        it('keeps the cents', () => {
            setup({ value: 1299.5 });
            expect(screen.getByText('$1,299.50')).toBeInTheDocument();
        });

        it('formats another currency and locale', () => {
            setup({ currency: 'EUR', locale: 'de-DE' });
            expect(screen.getByTestId('price')).toHaveTextContent(/54,00\s*€/);
        });

        it('formats a currency with no decimals', () => {
            setup({ value: 1200, currency: 'JPY', locale: 'ja-JP' });
            expect(screen.getByTestId('price')).toHaveTextContent(/1,200/);
            expect(screen.getByTestId('price')).not.toHaveTextContent(/\.00/);
        });

        it('prints the same without a locale, wherever it runs', () => {
            setup({ value: 10 });
            expect(screen.getByText('$10.00')).toBeInTheDocument();
        });
    });

    describe('sale', () => {
        it('shows only the price without compareAt', () => {
            const { container } = setup();
            expect(container.querySelector('del')).toBeNull();
            expect(screen.queryByText('Sale price')).toBeNull();
        });

        it('strikes through the original price when it is higher', () => {
            const { container } = setup({ compareAt: 62 });
            const old = container.querySelector('del')!;
            expect(old).toHaveTextContent('$62.00');
            expect(old).toHaveClass('tintora-price__compare');
            expect(screen.getByText('$54.00')).toHaveClass(
                'tintora-price__current',
            );
        });

        it.each([54, 40])(
            'ignores a compareAt of %s, not above the price',
            (n) => {
                const { container } = setup({ compareAt: n });
                expect(container.querySelector('del')).toBeNull();
            },
        );

        it('reads Sale price and Original price to assistive tech', () => {
            setup({ compareAt: 62 });
            expect(screen.getByTestId('price')).toHaveTextContent(
                'Sale price $54.00 Original price $62.00',
            );
        });

        it('takes translated labels', () => {
            setup({
                compareAt: 62,
                saleLabel: 'Prix soldé',
                originalLabel: 'Prix initial',
            });
            expect(screen.getByTestId('price')).toHaveTextContent(
                'Prix soldé $54.00 Prix initial $62.00',
            );
        });
    });

    describe('props', () => {
        it('keeps the consumer className and passes attributes through', () => {
            setup({ className: 'custom', id: 'p' });
            const el = screen.getByTestId('price');
            expect(el).toHaveClass('tintora-price', 'custom');
            expect(el).toHaveAttribute('id', 'p');
        });

        it('does not leak its props to the DOM', () => {
            setup({ compareAt: 62, currency: 'EUR', locale: 'de-DE' });
            const el = screen.getByTestId('price');
            for (const name of ['value', 'compareat', 'currency', 'locale']) {
                expect(el).not.toHaveAttribute(name);
            }
        });
    });

    describe('accessibility', () => {
        it('has no violations, on sale or not', async () => {
            const { container } = render(
                <>
                    <Price value={54} />
                    <Price value={54} compareAt={62} />
                </>,
            );
            await expectNoA11yViolations(container);
        });
    });
});
