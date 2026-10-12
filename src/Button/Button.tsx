import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonVariants = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSizes = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant: ButtonVariants;
    size?: ButtonSizes;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
}

export function Button({
    children,
    className,
    variant,
    size = 'medium',
    leadingIcon,
    trailingIcon,
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={clsx(
                'tintora-button',
                `tintora-button--${variant}`,
                `tintora-button--${size}`,
                {
                    'tintora-button--leading-icon': !!leadingIcon,
                    'tintora-button--trailing-icon': !!trailingIcon,
                },
                className,
            )}
            {...props}
        >
            {leadingIcon && (
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
        </button>
    );
}
