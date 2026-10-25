import { clsx } from '../utils/clsx';
import type { CSSProperties, HTMLAttributes } from 'react';
import './Skeleton.css';

export interface SkeletonProps extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children'
> {
    /** CSS length, or a number of pixels. Defaults to filling the container. */
    width?: number | string;
    /** CSS length, or a number of pixels. Defaults to 14px. */
    height?: number | string;
}

/**
 * A shimmering placeholder. Equal `width` and `height` make a circle (avatar),
 * a short `height` makes a line of text. It is decorative: mark the loading
 * region with `aria-busy` and announce progress yourself.
 */
export function Skeleton({
    width,
    height,
    className,
    style,
    ...props
}: SkeletonProps) {
    const size: CSSProperties = {
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
    };

    return (
        <span
            {...props}
            aria-hidden="true"
            className={clsx('tintora-skeleton', className)}
            style={{ ...size, ...style }}
        />
    );
}
