import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import './IconButton.css';

type IconButtonSizes = NonNullable<ButtonProps['size']>;

// Each IconButton variant builds on the Button variant closest to it.
const buttonVariant = {
    round: 'secondary',
    field: 'secondary',
    nav: 'ghost',
} as const;

type Shared = Omit<
    ButtonProps,
    | 'children'
    | 'type'
    | 'variant'
    | 'size'
    | 'leadingIcon'
    | 'trailingIcon'
    | 'aria-label'
> & {
    icon: ReactNode;
    /** There is no visible text, so an accessible name is required. */
    'aria-label': string;
};

export type IconButtonProps = Shared &
    (
        | {
              /** Filled circle. 32 / 36 / 44. */
              variant?: 'round';
              /** Large is the default: it meets the 44px hit area. */
              size?: IconButtonSizes;
              selected?: never;
          }
        | {
              /** Bordered circle for use next to inputs. Fixed at 48. */
              variant: 'field';
              size?: never;
              selected?: never;
          }
        | {
              /** Navigation item. Fixed at 44. */
              variant: 'nav';
              size?: never;
              /** The current destination. Sets `aria-current="page"`. */
              selected?: boolean;
          }
    );

export function IconButton({
    icon,
    variant = 'round',
    size,
    selected,
    className,
    ...props
}: IconButtonProps) {
    // Field and nav have one fixed size each, so only round gets a size class.
    const roundSize = variant === 'round' ? (size ?? 'large') : undefined;
    return (
        <Button
            {...props}
            variant={buttonVariant[variant]}
            aria-current={selected ? 'page' : undefined}
            className={clsx(
                'tintora-icon-button',
                `tintora-icon-button--${variant}`,
                roundSize && `tintora-icon-button--${roundSize}`,
                className,
            )}
            {...(roundSize && { size: roundSize })}
        >
            <span className="tintora-icon-button__icon" aria-hidden="true">
                {icon}
            </span>
        </Button>
    );
}
