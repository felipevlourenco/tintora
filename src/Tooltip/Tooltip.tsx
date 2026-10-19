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

interface Position {
    top: number;
    left: number;
}

/**
 * Viewport coordinates for the tooltip's top-left corner, given the trigger's
 * rect, the tooltip's own size, and the side it should open on.
 */
export function getPosition(
    anchor: DOMRect,
    tooltip: { width: number; height: number },
    placement: TooltipPlacement,
): Position {
    switch (placement) {
        case 'top':
            return {
                top: anchor.y - tooltip.height - GAP,
                left: anchor.x + anchor.width / 2 - tooltip.width / 2,
            };
        case 'bottom':
            return {
                top: anchor.y + anchor.height + GAP,
                left: anchor.x + anchor.width / 2 - tooltip.width / 2,
            };
        case 'left':
            return {
                top: anchor.y + anchor.height / 2 - tooltip.height / 2,
                left: anchor.x - tooltip.width - GAP,
            };
        case 'right':
            return {
                top: anchor.y + anchor.height / 2 - tooltip.height / 2,
                left: anchor.x + anchor.width + GAP,
            };
    }
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

    const style: CSSProperties | undefined = position ?? {
        visibility: 'hidden',
    };

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
                        `tintora-tooltip__content--${placement}`,
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
