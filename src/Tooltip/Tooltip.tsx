'use client';

import { clsx } from '../utils/clsx';
import {
    cloneElement,
    useEffect,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type ReactElement,
} from 'react';
import { getPosition, type Placement } from '../utils/placement';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useTopLayerPosition } from '../hooks/useTopLayerPosition';
import './Tooltip.css';

export type TooltipPlacement = Placement;

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

/** How long the pointer may spend crossing the gap before the tooltip closes. */
const CLOSE_DELAY_MS = 100;

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

    // Fixed to the viewport in the top layer, so no card clips it.
    const position = useTopLayerPosition(
        open,
        tooltipRef,
        () => {
            const tooltip = tooltipRef.current;
            const trigger = rootRef.current?.firstElementChild;
            if (!tooltip || !trigger) return null;
            return getPosition(
                trigger.getBoundingClientRect(),
                { width: tooltip.offsetWidth, height: tooltip.offsetHeight },
                placement,
            );
        },
        [placement, title, content, shortcut],
    );

    // Escape dismisses it without moving focus.
    useEscapeKey(open, () => setOpen(false));

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
