import { clsx } from '../utils/clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Chip.css';

export interface ChipProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type'
> {
    /** When set, the chip is a toggle and renders aria-pressed. When omitted, it is a plain button. */
    selected?: boolean;
    children: ReactNode;
}

export function Chip({
    children,
    selected,
    className,
    'aria-pressed': ariaPressed,
    ...props
}: ChipProps) {
    return (
        <button
            {...props}
            type="button"
            className={clsx('tintora-chip', className)}
            aria-pressed={selected ?? ariaPressed}
        >
            {children}
        </button>
    );
}
