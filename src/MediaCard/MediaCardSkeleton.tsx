import type { HTMLAttributes } from 'react';
import { Skeleton } from '../Skeleton/Skeleton';
import { clsx } from '../utils/clsx';
import './MediaCard.css';

export interface MediaCardSkeletonProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'children' | 'title'
> {
    /**
     * The element to render. Use `li` for a card inside a `<ul>` grid.
     * @default 'div'
     */
    as?: 'div' | 'li';
    /**
     * CSS `aspect-ratio` of the media box. Match the `MediaCard` it stands in
     * for, so the grid does not jump when the cards arrive.
     * @default '5 / 4'
     */
    mediaAspectRatio?: string;
}

/**
 * A shimmering stand-in for a `MediaCard` while its data loads. It has the
 * same classes and layout, so it takes the same space. It is decorative:
 * mark the list that holds the placeholders with `aria-busy` as well, and
 * announce the loading yourself.
 */
export function MediaCardSkeleton({
    as: Element = 'div',
    mediaAspectRatio = '5 / 4',
    className,
    ...props
}: MediaCardSkeletonProps) {
    return (
        <Element
            {...props}
            aria-busy="true"
            data-theme="light"
            className={clsx(
                'tintora-media-card',
                'tintora-media-card--loading',
                className,
            )}
        >
            <div
                className="tintora-media-card__media"
                style={
                    {
                        '--tintora-media-card-ratio': mediaAspectRatio,
                    } as React.CSSProperties
                }
            >
                <Skeleton height="auto" />
            </div>
            <div className="tintora-media-card__details">
                <Skeleton width="30%" height={11} />
                <Skeleton width="70%" height={16} style={{ marginTop: 8 }} />
                <Skeleton width="40%" height={11} style={{ marginTop: 8 }} />
            </div>
            <div className="tintora-media-card__footer">
                <Skeleton width={84} height={24} />
                <Skeleton width={72} height={36} />
            </div>
        </Element>
    );
}
