import { clsx } from '../utils/clsx';
import type { HTMLAttributes } from 'react';
import './Dot.css';

type DotVariant = 'unread' | 'read' | 'tick';

export interface DotProps extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children'
> {
    /** unread: filled 8px. read: 8px ring. tick: 3×15 section marker. */
    variant?: DotVariant;
    /** What the dot means to assistive tech, e.g. "Unread". Omit when it is decorative. */
    label?: string;
}

export function Dot({
    variant = 'unread',
    label,
    className,
    ...props
}: DotProps) {
    return (
        <span
            {...props}
            className={clsx(
                'tintora-dot',
                `tintora-dot--${variant}`,
                className,
            )}
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
        />
    );
}
