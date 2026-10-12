import clsx from 'clsx';
import type { ReactNode } from 'react';
import { Button, type ButtonProps } from '../Button/Button';
import './IconButton.css';

type IconButtonSizes = NonNullable<ButtonProps['size']>;

type IconButtonVariants = 'round';

// A round icon button is a secondary Button squared into a circle.
const buttonVariant = { round: 'secondary' } as const;

export interface IconButtonProps extends Omit<
    ButtonProps,
    | 'children'
    | 'type'
    | 'variant'
    | 'size'
    | 'leadingIcon'
    | 'trailingIcon'
    | 'aria-label'
> {
    variant?: IconButtonVariants;
    /** 32 / 36 / 44. Large is the default: it meets the 44px hit area. */
    size?: IconButtonSizes;
    icon: ReactNode;
    /** There is no visible text, so an accessible name is required. */
    'aria-label': string;
}

export function IconButton({
    icon,
    size = 'large',
    variant = 'round',
    className,
    ...props
}: IconButtonProps) {
    return (
        <Button
            {...props}
            variant={buttonVariant[variant]}
            size={size}
            className={clsx(
                'tintora-icon-button',
                `tintora-icon-button--${variant}`,
                `tintora-icon-button--${size}`,
                className,
            )}
        >
            <span className="tintora-icon-button__icon" aria-hidden="true">
                {icon}
            </span>
        </Button>
    );
}
