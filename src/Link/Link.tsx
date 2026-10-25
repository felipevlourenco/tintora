import { clsx } from '../utils/clsx';
import type { ComponentPropsWithoutRef, ElementType } from 'react';
import './Link.css';

export type LinkProps<C extends ElementType = 'a'> = {
    /**
     * What to render: `'a'`, or a router's link such as Next's `Link`. Its own
     * props (`href`, `to`, `prefetch`, ...) are then accepted and type-checked.
     * @default 'a'
     */
    as?: C;
    /**
     * `accent` and `white` are coloured and underlined. `transparent` applies
     * no style (it inherits the colour and has no underline), for wrapping a
     * card or any block; only the keyboard focus ring stays.
     * @default 'accent'
     */
    variant?: 'accent' | 'white' | 'transparent';
    className?: string;
} & Omit<ComponentPropsWithoutRef<C>, 'as' | 'variant' | 'className'>;

/**
 * Tintora's link style on an `<a>`, or on any component that takes
 * `className` and `children`, so a router link keeps client-side navigation.
 */
export function Link<C extends ElementType = 'a'>({
    as,
    variant = 'accent',
    className,
    ...props
}: LinkProps<C>) {
    const Component: ElementType = as ?? 'a';
    return (
        <Component
            {...props}
            className={clsx(
                'tintora-link',
                `tintora-link--${variant}`,
                className,
            )}
        />
    );
}
