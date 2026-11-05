'use client';

import { useState, type HTMLAttributes, type ReactNode } from 'react';
import { IconButton } from '../IconButton/IconButton';
import { clsx } from '../utils/clsx';
import './MediaCarousel.css';

function getNextItem(
    items: MediaCarouselItem[],
    currentId: string,
): MediaCarouselItem {
    const currentIndex = items.findIndex((item) => item.id === currentId);
    const nextIndex = (currentIndex + 1) % items.length;
    return items[nextIndex];
}

function getPreviousItem(
    items: MediaCarouselItem[],
    currentId: string,
): MediaCarouselItem {
    const currentIndex = items.findIndex((item) => item.id === currentId);
    const previousIndex = (currentIndex - 1 + items.length) % items.length;
    return items[previousIndex];
}

const Chevron = () => (
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
        <path d="M9 6l6 6-6 6" />
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

export function MediaCarousel({
    items,
    value,
    onValueChange,
    defaultValue,
    className,
    ['aria-label']: ariaLabel = 'Gallery',
    previousLabel = 'Previous image',
    nextLabel = 'Next image',
    ...props
}: MediaCarouselProps): ReactNode {
    const [internalValue, setInternalValue] = useState<MediaCarouselItem>(
        items.find((item) => item.id === defaultValue) ?? items[0],
    );
    const isControlled = value !== undefined;
    // The props type guarantees exactly one of the two is set.
    const selected = isControlled
        ? (items.find((item) => item.id === value) ?? items[0])
        : internalValue;

    const handleValueChange = (id: string) => {
        const newValue = items.find((item) => item.id === id);
        if (newValue) {
            setInternalValue(newValue);
            onValueChange?.(id);
        }
    };

    if (items.length < 1) {
        return null;
    }

    const firstId = items[0].id;
    const lastId = items[items.length - 1].id;

    return (
        <div
            role="region"
            aria-label={ariaLabel}
            className={clsx('tintora-media-carousel', className)}
            {...props}
        >
            <div className="tintora-media-carousel__media-container">
                <IconButton
                    variant="round"
                    aria-label={previousLabel}
                    data-theme="light"
                    className={clsx(
                        'tintora-media-carousel__media-container__button',
                        'tintora-media-carousel__media-container__button--previous',
                    )}
                    icon={<Chevron />}
                    disabled={selected.id === firstId}
                    onClick={() =>
                        handleValueChange(
                            getPreviousItem(items, selected.id).id,
                        )
                    }
                />
                {selected.media}
                <IconButton
                    variant="round"
                    aria-label={nextLabel}
                    data-theme="light"
                    className={clsx(
                        'tintora-media-carousel__media-container__button',
                        'tintora-media-carousel__media-container__button--next',
                    )}
                    icon={<Chevron />}
                    disabled={selected.id === lastId}
                    onClick={() =>
                        handleValueChange(getNextItem(items, selected.id).id)
                    }
                />
            </div>
            <ul className="tintora-media-carousel__thumbnails">
                {items.map((item) => (
                    <button
                        key={item.id}
                        aria-live="polite"
                        className={clsx(
                            'tintora-media-carousel__thumbnails--item',
                            item.id === selected.id &&
                                'tintora-media-carousel__thumbnails--item--selected',
                        )}
                        aria-current={item.id === selected.id}
                        onClick={() => handleValueChange(item.id)}
                    >
                        {item.thumbnail ?? item.media}
                    </button>
                ))}
            </ul>
        </div>
    );
}
