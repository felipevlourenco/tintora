import clsx from 'clsx';
import {
    cloneElement,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactElement,
} from 'react';
import './Tooltip.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
    /** The text. Required, and what a screen reader announces. */
    content: string;
    /** Rich variant: a bold title above `content`, max 220px wide, wraps. */
    title?: string;
    /** Shortcut rendered as a <kbd> chip, e.g. "Ctrl K". */
    shortcut?: string;
    /** Default 'top'. */
    placement?: TooltipPlacement;
    /** Exactly one focusable element: the trigger. It must pass unknown props (like aria-describedby) on to a DOM element. */
    children: ReactElement<{ 'aria-describedby'?: string }>;
    className?: string;
}

/** Space between the trigger and the tooltip (the arrow sits inside it). */
const GAP = 10;
/** How long the pointer may spend crossing the gap before the tooltip closes. */
const CLOSE_DELAY_MS = 100;

/** Closest the tooltip may get to a viewport edge. */
const VIEWPORT_MARGIN = 8;
/** Keeps the arrow clear of the tooltip's rounded corners. */
const ARROW_INSET = 12;

interface Size {
    width: number;
    height: number;
}

interface Position {
    top: number;
    left: number;
    /** The side it really opens on: the requested one, or the opposite if flipped. */
    placement: TooltipPlacement;
    /** Distance in px from the tooltip's start edge to the arrow's centre. */
    arrowOffset: number;
}

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));

/**
 * The side the tooltip should open on: the requested one when it fits in the
 * viewport, otherwise the opposite one. `OPPOSITE` maps each side to its pair.
 */
function pickPlacement(
    anchor: DOMRect,
    tooltip: Size,
    placement: TooltipPlacement,
    viewport: Size,
): TooltipPlacement {
    const roomOn = (side: TooltipPlacement) => {
        switch (side) {
            case 'top':
                return anchor.top;
            case 'bottom':
                return viewport.height - anchor.bottom;
            case 'left':
                return anchor.left;
            case 'right':
                return viewport.width - anchor.right;
        }
    };
    const vertical = placement === 'top' || placement === 'bottom';
    const needed =
        (vertical ? tooltip.height : tooltip.width) + GAP + VIEWPORT_MARGIN;
    const here = roomOn(placement);

    // Flip only when it does not fit here and the other side has more room.
    return here >= needed || roomOn(OPPOSITE[placement]) <= here
        ? placement
        : OPPOSITE[placement];
}

/**
 * Viewport coordinates for the tooltip's top-left corner, given the trigger's
 * rect, the tooltip's own size, the side it should open on and the viewport.
 * It flips to the opposite side when there is no room, and is kept inside the
 * viewport along the other axis (the arrow then moves to keep pointing at the
 * trigger).
 */
export function getPosition(
    anchor: DOMRect,
    tooltip: Size,
    requested: TooltipPlacement,
    viewport: Size = { width: window.innerWidth, height: window.innerHeight },
): Position {
    const placement = pickPlacement(anchor, tooltip, requested, viewport);
    const vertical = placement === 'top' || placement === 'bottom';

    let top: number;
    let left: number;
    switch (placement) {
        case 'top':
            top = anchor.y - tooltip.height - GAP;
            left = anchor.x + anchor.width / 2 - tooltip.width / 2;
            break;
        case 'bottom':
            top = anchor.y + anchor.height + GAP;
            left = anchor.x + anchor.width / 2 - tooltip.width / 2;
            break;
        case 'left':
            top = anchor.y + anchor.height / 2 - tooltip.height / 2;
            left = anchor.x - tooltip.width - GAP;
            break;
        case 'right':
            top = anchor.y + anchor.height / 2 - tooltip.height / 2;
            left = anchor.x + anchor.width + GAP;
            break;
    }

    // Clamp along the cross axis only: the main axis was settled by the flip.
    if (vertical) {
        left = clamp(
            left,
            VIEWPORT_MARGIN,
            viewport.width - tooltip.width - VIEWPORT_MARGIN,
        );
    } else {
        top = clamp(
            top,
            VIEWPORT_MARGIN,
            viewport.height - tooltip.height - VIEWPORT_MARGIN,
        );
    }

    const arrowOffset = vertical
        ? anchor.x + anchor.width / 2 - left
        : anchor.y + anchor.height / 2 - top;
    const size = vertical ? tooltip.width : tooltip.height;

    return {
        top,
        left,
        placement,
        arrowOffset: clamp(arrowOffset, ARROW_INSET, size - ARROW_INSET),
    };
}

export function Tooltip({
    title,
    content,
    shortcut,
    children,
    className,
    placement = 'top',
}: TooltipProps) {
    const id = useId();
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<Position | null>(null);
    const rootRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const closeTimer = useRef<number>(undefined);

    const show = () => {
        window.clearTimeout(closeTimer.current);
        setOpen(true);
    };
    // A short delay lets the pointer cross the gap onto the tooltip itself.
    const hide = () => {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = window.setTimeout(
            () => setOpen(false),
            CLOSE_DELAY_MS,
        );
    };

    // The tooltip is fixed to the viewport (top layer, so no card clips it).
    // It is measured once it is in the DOM, then placed.
    useLayoutEffect(() => {
        const tooltip = tooltipRef.current;
        const trigger = rootRef.current?.firstElementChild;
        if (!open || !tooltip || !trigger) {
            setPosition(null);
            return;
        }
        tooltip.showPopover();
        setPosition(
            getPosition(
                trigger.getBoundingClientRect(),
                { width: tooltip.offsetWidth, height: tooltip.offsetHeight },
                placement,
            ),
        );
    }, [open, placement, title, content, shortcut]);

    // Escape dismisses it without moving focus.
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open]);

    useEffect(() => () => window.clearTimeout(closeTimer.current), []);

    const style: CSSProperties & { '--tintora-tooltip-arrow-offset'?: string } =
        position
            ? {
                  top: position.top,
                  left: position.left,
                  '--tintora-tooltip-arrow-offset': `${position.arrowOffset}px`,
              }
            : { visibility: 'hidden' };

    return (
        <span
            ref={rootRef}
            className="tintora-tooltip"
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
        >
            {cloneElement(children, {
                'aria-describedby':
                    clsx(children.props['aria-describedby'], open && id) ||
                    undefined,
            })}
            {open && (
                <div
                    id={id}
                    ref={tooltipRef}
                    role="tooltip"
                    popover="manual"
                    style={style}
                    className={clsx(
                        'tintora-tooltip__content',
                        `tintora-tooltip__content--${position?.placement ?? placement}`,
                        title && 'tintora-tooltip__content--rich',
                        className,
                    )}
                >
                    {title && (
                        <span className="tintora-tooltip__title">{title}</span>
                    )}
                    <span className="tintora-tooltip__text">{content}</span>
                    {shortcut && (
                        <kbd className="tintora-tooltip__shortcut">
                            {shortcut}
                        </kbd>
                    )}
                </div>
            )}
        </span>
    );
}
