import { clsx } from '../utils/clsx';
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { Spinner } from '../Spinner/Spinner';
import './Button.css';

type ButtonVariants = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSizes = 'small' | 'medium' | 'large';

export type ButtonProps<C extends ElementType = 'button'> = {
    /**
     * What to render: `'button'`, `'a'`, or a router's link such as Next's
     * `Link`. Its own props (`href`, `to`, ...) are then accepted and
     * type-checked. @default 'button'
     */
    as?: C;
    variant: ButtonVariants;
    size?: ButtonSizes;
    /**
     * A `button` gets the `disabled` attribute. Anything else gets
     * `aria-disabled`, is taken out of the tab order and ignores the pointer.
     */
    disabled?: boolean;
    loading?: boolean;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    fullWidth?: boolean;
    className?: string;
    children?: ReactNode;
} & Omit<
    ComponentPropsWithoutRef<C>,
    | 'as'
    | 'variant'
    | 'size'
    | 'disabled'
    | 'loading'
    | 'leadingIcon'
    | 'trailingIcon'
    | 'fullWidth'
    | 'className'
    | 'children'
>;

export function Button<C extends ElementType = 'button'>({
    as,
    children,
    className,
    variant,
    disabled,
    leadingIcon,
    trailingIcon,
    size = 'medium',
    loading = false,
    fullWidth = false,
    ...props
}: ButtonProps<C>) {
    const Component: ElementType = as ?? 'button';
    const inactive = disabled || loading;
    return (
        <Component
            className={clsx(
                'tintora-button',
                `tintora-button--${variant}`,
                `tintora-button--${size}`,
                {
                    'tintora-button--leading-icon': !!leadingIcon || loading,
                    'tintora-button--loading': loading,
                    'tintora-button--trailing-icon': !!trailingIcon,
                    'tintora-button--full-width': fullWidth,
                },
                className,
            )}
            {...(Component === 'button'
                ? { type: 'button', disabled: inactive }
                : inactive && { 'aria-disabled': true, tabIndex: -1 })}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading && (
                <span className="tintora-button__icon" aria-hidden="true">
                    <Spinner size="small" color="current" />
                </span>
            )}
            {!loading && leadingIcon && (
                <span className="tintora-button__icon" aria-hidden="true">
                    {leadingIcon}
                </span>
            )}
            {children}
            {trailingIcon && (
                <span className="tintora-button__icon" aria-hidden="true">
                    {trailingIcon}
                </span>
            )}
        </Component>
    );
}
