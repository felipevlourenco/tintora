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
    type ReactNode,
} from 'react';
import {
    getPosition,
    type Alignment,
    type Placement,
} from '../utils/placement';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useTopLayerPosition } from '../hooks/useTopLayerPosition';
import './Tooltip.css';

/**
 * The side of the trigger, optionally with where along it: `'top'` is centred,
 * `'top-start'` lines up with the trigger's left edge and `'top-end'` with its
 * right. For `'left'` and `'right'`, start and end are the top and bottom edges.
 */
export type TooltipPlacement =
    Placement | `${Placement}-${Exclude<Alignment, 'center'>}`;

export interface TooltipProps {
    /** The text. Required, and what a screen reader announces. */
    content: string;
    /** Rich variant: a bold title above `content`, max 220px wide, wraps. */
    title?: string;
    /** Shortcut rendered as a <kbd> chip, e.g. "Ctrl K". */
    shortcut?: string;
    /** Default 'top'. */
    placement?: TooltipPlacement;
    /** A decorative icon before the text, such as a small info glyph. Hidden from assistive tech. */
    icon?: ReactNode;
    /**
     * The tooltip's own colour. `'auto'` follows the page theme, where a
     * tooltip is the inverse of it: dark on a light page, light on a dark one.
     * `'light'` and `'dark'` stay that colour in either theme, for a tooltip
     * over a surface that does not follow the theme.
     * @default 'auto'
     */
    tone?: 'auto' | 'light' | 'dark';
    /**
     * Whether it points at the trigger. Without one it sits closer to it.
     * @default true
     */
    arrow?: boolean;
    /** Exactly one focusable element: the trigger. It must pass unknown props (like aria-describedby) on to a DOM element. */
    children: ReactElement<{ 'aria-describedby'?: string }>;
    className?: string;
}

/** How long the pointer may spend crossing the gap before the tooltip closes. */
const CLOSE_DELAY_MS = 100;
/**
 * A tooltip is the inverse of its page: dark on a light page, light on a dark
 * one. So its light colours are in the dark theme's tokens, and a fixed tone
 * borrows the opposite theme.
 */
const TONE_THEME = { light: 'dark', dark: 'light' } as const;
/** The gap to the trigger: room for the arrow, or less when there is none. */
const ARROW_GAP = 10;
const FLAT_GAP = 6;

export function Tooltip({
    title,
    content,
    shortcut,
    children,
    className,
    placement = 'top',
    icon,
    tone = 'auto',
    arrow = true,
}: TooltipProps) {
    const id = useId();
    // 'top-end' is the side 'top' with the alignment 'end'.
    const [side, align = 'center'] = placement.split('-') as [
        Placement,
        Alignment?,
    ];
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
                side,
                undefined,
                { align, gap: arrow ? ARROW_GAP : FLAT_GAP },
            );
        },
        [placement, title, content, shortcut, arrow, icon != null],
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
                    // A fixed tone is a theme of its own for this subtree.
                    data-theme={tone === 'auto' ? undefined : TONE_THEME[tone]}
                    className={clsx(
                        'tintora-tooltip__content',
                        `tintora-tooltip__content--${position?.placement ?? side}`,
                        title && 'tintora-tooltip__content--rich',
                        icon != null && 'tintora-tooltip__content--with-icon',
                        !arrow && 'tintora-tooltip__content--no-arrow',
                        className,
                    )}
                >
                    {icon != null && (
                        <span
                            className="tintora-tooltip__icon"
                            aria-hidden="true"
                        >
                            {icon}
                        </span>
                    )}
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
