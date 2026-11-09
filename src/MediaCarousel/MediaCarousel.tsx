'use client';

import {
    useRef,
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type KeyboardEvent,
    type PointerEvent,
    type ReactNode,
} from 'react';
import { IconButton } from '../IconButton/IconButton';
import { clsx } from '../utils/clsx';
import './MediaCarousel.css';

const Chevron = ({ direction }: { direction: 'left' | 'right' }) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
);

export interface MediaCarouselItem {
    /** Identifies the item: it is the carousel's value and the React key. */
    id: string;
    /** The full-size picture. The consumer supplies the `alt`. */
    media: ReactNode;
    /** The small picture in the strip. Falls back to `media`. */
    thumbnail?: ReactNode;
    /** Names the thumbnail button, such as "Front view". */
    label: string;
}

interface MediaCarouselBaseProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'children' | 'defaultValue' | 'onChange'
> {
    /**
     * The pictures, in order. With none the carousel renders nothing; with
     * one it shows no arrows and no thumbnails.
     */
    items: MediaCarouselItem[];
    /** Overlaid on the picture, top left. A `Tag`, usually. */
    badge?: ReactNode;
    /**
     * CSS `aspect-ratio` of the picture box, so the carousel does not jump
     * between pictures of different sizes.
     * @default '8 / 7'
     */
    mediaAspectRatio?: string;
    /**
     * The landmark's name. Set it to translate it.
     * @default 'Gallery'
     */
    'aria-label'?: string;
    /** @default 'Previous image' */
    previousLabel?: string;
    /** @default 'Next image' */
    nextLabel?: string;
}

/** The parent owns the value: it passes `value` and updates it in `onValueChange`. */
interface ControlledProps {
    value: string;
    onValueChange: (id: string) => void;
    defaultValue?: never;
}

/** The carousel owns the value, starting from `defaultValue` (the first item if omitted). */
interface UncontrolledProps {
    value?: never;
    defaultValue?: string;
    onValueChange?: (id: string) => void;
}

/** Exactly one of controlled (`value`) or uncontrolled (`defaultValue`). */
export type MediaCarouselProps = MediaCarouselBaseProps &
    (ControlledProps | UncontrolledProps);

/**
 * One large picture with previous and next arrows floating over its sides,
 * and a strip of selectable thumbnails under it. The strip is hidden on small
 * screens (the same `max-width: 480px` breakpoint as `Drawer`).
 * At the first and last picture the matching arrow is disabled.
 */

// A swipe is a horizontal drag of at least this many px, and more horizontal
// than vertical, so a tap or a page scroll does not count.
const SWIPE_DISTANCE = 50;

export function MediaCarousel({
    items,
    value,
    defaultValue,
    onValueChange,
    badge,
    mediaAspectRatio = '8 / 7',
    className,
    'aria-label': ariaLabel = 'Gallery',
    previousLabel = 'Previous image',
    nextLabel = 'Next image',
    ...props
}: MediaCarouselProps): ReactNode {
    const [internalId, setInternalId] = useState(defaultValue);
    const swipeStart = useRef<{ x: number; y: number } | null>(null);

    if (items.length < 1) {
        return null;
    }

    // The props type guarantees exactly one of `value` and `defaultValue`.
    const currentId = value ?? internalId;
    const index = Math.max(
        items.findIndex((item) => item.id === currentId),
        0,
    );
    const selected = items[index];

    const select = (item: MediaCarouselItem) => {
        if (value === undefined) setInternalId(item.id);
        onValueChange?.(item.id);
    };

    const ratio: CSSProperties & { '--tintora-media-carousel-ratio': string } =
        { '--tintora-media-carousel-ratio': mediaAspectRatio };
    const hasMany = items.length > 1;

    // Touch and pen only: a mouse drag would fight the browser's image drag.
    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        swipeStart.current =
            event.pointerType === 'mouse'
                ? null
                : { x: event.clientX, y: event.clientY };
    };
    const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
        const start = swipeStart.current;
        swipeStart.current = null;
        if (!start || !hasMany) return;

        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy))
            return;

        // Swiping left reveals the next picture, like dragging the strip.
        const target = items[dx < 0 ? index + 1 : index - 1];
        if (target) select(target);
    };

    // Arrow keys, Home and End move between thumbnails: one tab stop for the
    // strip (the current thumbnail), selection following focus. No wrapping,
    // like the arrow buttons. The new thumbnail is clicked, so it goes through
    // the same `select` as a mouse click.
    const handleThumbnailKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
    ) => {
        const target = {
            Home: 0,
            End: items.length - 1,
            ArrowRight: index + 1,
            ArrowLeft: index - 1,
        }[event.key];
        if (target === undefined) return;

        event.preventDefault();
        if (target !== index) {
            const next = event.currentTarget
                .closest('ul')
                ?.querySelectorAll<HTMLButtonElement>('button')[target];
            next?.focus();
            next?.click();
        }
    };

    return (
        <div
            {...props}
            role="region"
            aria-label={ariaLabel}
            className={clsx('tintora-media-carousel', className)}
        >
            <div
                className="tintora-media-carousel__stage"
                style={ratio}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={() => (swipeStart.current = null)}
            >
                <div
                    className="tintora-media-carousel__slide"
                    aria-live="polite"
                >
                    {selected.media}
                </div>
                {badge && (
                    <div className="tintora-media-carousel__badge">{badge}</div>
                )}
                {hasMany && (
                    <>
                        <IconButton
                            variant="round"
                            data-theme="light"
                            aria-label={previousLabel}
                            icon={<Chevron direction="left" />}
                            className="tintora-media-carousel__arrow tintora-media-carousel__arrow--previous"
                            disabled={index === 0}
                            onClick={() => select(items[index - 1])}
                        />
                        <IconButton
                            variant="round"
                            data-theme="light"
                            aria-label={nextLabel}
                            icon={<Chevron direction="right" />}
                            className="tintora-media-carousel__arrow tintora-media-carousel__arrow--next"
                            disabled={index === items.length - 1}
                            onClick={() => select(items[index + 1])}
                        />
                    </>
                )}
            </div>
            {hasMany && (
                <ul className="tintora-media-carousel__thumbnails">
                    {items.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onKeyDown={handleThumbnailKeyDown}
                                tabIndex={item.id === selected.id ? 0 : -1}
                                aria-label={item.label}
                                aria-current={
                                    item.id === selected.id ? 'true' : undefined
                                }
                                className="tintora-media-carousel__thumbnail"
                                onClick={() => select(item)}
                            >
                                {item.thumbnail ?? item.media}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
