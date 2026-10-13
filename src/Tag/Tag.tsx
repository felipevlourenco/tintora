import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';
import './Tag.css';

type TagVariant = 'neutral' | 'success' | 'accent' | 'card';
type TagSize = 'small' | 'medium' | 'large';

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode;
    variant?: TagVariant;
    size?: TagSize;
}

export function Tag({
    children,
    className,
    variant = 'neutral',
    size = 'medium',
    ...props
}: TagProps) {
    return (
        <span
            {...props}
            className={clsx(
                'tintora-tag',
                `tintora-tag--${variant}`,
                `tintora-tag--${size}`,
                className,
            )}
        >
            {children}
        </span>
    );
}
