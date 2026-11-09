import type { HTMLAttributes } from 'react';
import { clsx } from '../utils/clsx';
import './Price.css';

export interface PriceProps extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children'
> {
    /** The price to pay, in the currency's main unit: 54 is $54.00. */
    value: number;
    /**
     * The price before the discount, shown struck through. Ignored unless it
     * is higher than `value`.
     */
    compareAt?: number;
    /** An ISO 4217 code. @default 'USD' */
    currency?: string;
    /**
     * A BCP 47 tag for the number format. It is fixed by default (not read
     * from the environment), so a server and a browser print the same text.
     * @default 'en-US'
     */
    locale?: string;
    /**
     * Read before the current price when there is a discount. Set it to
     * translate it.
     * @default 'Sale price'
     */
    saleLabel?: string;
    /**
     * Read before the struck-through price. Set it to translate it.
     * @default 'Original price'
     */
    originalLabel?: string;
}

/**
 * A formatted price, with the original one struck through when it is on sale.
 * The size and font follow the surrounding text.
 */
export function Price({
    value,
    compareAt,
    currency = 'USD',
    locale = 'en-US',
    saleLabel = 'Sale price',
    originalLabel = 'Original price',
    className,
    ...props
}: PriceProps) {
    const format = (amount: number) =>
        new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
            amount,
        );
    const onSale = compareAt !== undefined && compareAt > value;

    return (
        <span {...props} className={clsx('tintora-price', className)}>
            {onSale && (
                <span className="tintora-price__label">{saleLabel} </span>
            )}
            <span className="tintora-price__current">{format(value)}</span>
            {onSale && (
                <>
                    {' '}
                    <span className="tintora-price__label">
                        {originalLabel}{' '}
                    </span>
                    <del className="tintora-price__compare">
                        {format(compareAt)}
                    </del>
                </>
            )}
        </span>
    );
}
