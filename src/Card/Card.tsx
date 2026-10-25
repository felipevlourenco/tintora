import { clsx } from '../utils/clsx';
import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import './Card.css';

type CardElement = 'article' | 'div' | 'section' | 'li';

export interface CardProps extends HTMLAttributes<HTMLElement> {
    /** `surface` is the light card; `row` is the translucent list row. @default 'surface' */
    variant?: 'surface' | 'row';
    /** The element to render. @default 'article' */
    as?: CardElement;
}

export function Card({
    as: Element = 'article',
    variant = 'surface',
    className,
    ...props
}: CardProps) {
    return (
        <Element
            {...props}
            className={clsx(
                'tintora-card',
                `tintora-card--${variant}`,
                className,
            )}
        />
    );
}

export interface SelectableCardProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type'
> {
    /** Rendered as `aria-pressed`. @default false */
    selected?: boolean;
}

/**
 * A card that toggles on click. It is a single button, so keep other
 * buttons out of it.
 */
export function SelectableCard({
    selected = false,
    className,
    ...props
}: SelectableCardProps) {
    return (
        <button
            {...props}
            type="button"
            aria-pressed={selected}
            className={clsx(
                'tintora-card',
                'tintora-card--surface',
                'tintora-card--selectable',
                selected && 'tintora-card--selected',
                className,
            )}
        />
    );
}
