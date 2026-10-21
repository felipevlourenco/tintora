import clsx from 'clsx';
import {
    cloneElement,
    CSSProperties,
    useId,
    useLayoutEffect,
    useRef,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
} from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useOutsidePress } from '../hooks/useOutsidePress';
import { useTopLayerPosition } from '../hooks/useTopLayerPosition';
import { getPosition, type Placement } from '../utils/placement';
import './Popover.css';

export type PopoverPlacement = Placement;

export interface PopoverProps {
    /** Controlled: the parent owns whether it is open. */
    open: boolean;
    /**
     * Called with `false` on Esc, an outside press and the trigger toggling,
     * and with `true` when the trigger is pressed while closed.
     */
    onOpenChange: (open: boolean) => void;
    /**
     * Exactly one focusable element. It gets `aria-expanded`, `aria-controls`
     * and `aria-haspopup="dialog"`, so it must pass unknown props on to a DOM
     * element. Focus returns to it when the popover closes.
     */
    trigger: ReactElement<
        Record<string, unknown> & { onClick: (event: MouseEvent) => void }
    >;
    /** Names the panel for assistive tech. Required: it has no visible label of its own. */
    title: string;
    /** The panel's content: a short task, such as a choice or a confirmation. */
    children: ReactNode;
    /**
     * `alertdialog` is for confirmations: focus starts on the safe action.
     * @default 'dialog'
     */
    role?: 'dialog' | 'alertdialog';
    /** The side of the trigger it opens on; flips when there is no room. @default 'bottom' */
    placement?: PopoverPlacement;
    /**
     * `md` is a 300px panel (radius 22, padding 18); `sm` fills its container
     * (radius 20, padding 16).
     * @default 'md'
     */
    size?: 'md' | 'sm';
    className?: string;
}

const FOCUSABLE =
    'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function Popover({
    open,
    onOpenChange,
    trigger,
    title,
    children,
    role = 'dialog',
    size = 'md',
    placement = 'bottom',
    className,
}: PopoverProps) {
    const id = useId();
    const rootRef = useRef<HTMLSpanElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerHasFocusRef = useRef<boolean>(null);

    const close = () => {
        onOpenChange(false);

        if (
            triggerHasFocusRef.current &&
            rootRef.current?.firstElementChild instanceof HTMLElement
        ) {
            rootRef.current?.firstElementChild.focus();
        }
    };
    // The popover is manual, so Esc and light dismiss are ours.
    useEscapeKey(open, close);
    useOutsidePress(open, rootRef, close);

    const triggerClickHandler = (event: MouseEvent) => {
        trigger.props.onClick?.(event);

        if (!event.defaultPrevented) {
            onOpenChange(!open);
        }
    };

    // Fixed to the viewport in the top layer, so no card clips it.
    const position = useTopLayerPosition(
        open,
        panelRef,
        () => {
            const panel = panelRef.current;
            const trigger = rootRef.current?.firstElementChild;

            if (!panel || !trigger) {
                return null;
            }

            return getPosition(
                trigger.getBoundingClientRect(),
                { width: panel.offsetWidth, height: panel.offsetHeight },
                placement,
                undefined,
                { gap: 12 },
            );
        },
        [placement, title, children],
    );

    const style: CSSProperties & { '--tintora-popover-arrow-offset'?: string } =
        position
            ? {
                  top: position.top,
                  left: position.left,
                  '--tintora-popover-arrow-offset': `${position.arrowOffset}px`,
              }
            : { visibility: 'hidden' };

    useLayoutEffect(() => {
        const panel = panelRef.current;
        const trigger = rootRef.current?.firstElementChild;

        triggerHasFocusRef.current =
            Boolean(trigger) && document.activeElement === trigger;

        if (open && panel && position) {
            // Focus moves in: the marked element, the first one, or the panel.
            (
                panel.querySelector<HTMLElement>('[data-autofocus]') ??
                panel.querySelector<HTMLElement>(FOCUSABLE) ??
                panel
            ).focus();
        }
    }, [open, position]);

    return (
        <span ref={rootRef} className="tintora-popover-root">
            {cloneElement(trigger, {
                'aria-haspopup': 'dialog',
                'aria-expanded': open,
                'aria-controls': open ? id : undefined,
                onClick: triggerClickHandler,
            })}
            {open && (
                <div
                    id={id}
                    ref={panelRef}
                    role={role}
                    aria-label={title}
                    popover="manual"
                    tabIndex={-1}
                    className={clsx(
                        'tintora-popover',
                        `tintora-popover--${size}`,
                        `tintora-popover--${position?.placement}`,
                        className,
                    )}
                    style={style}
                >
                    {children}
                </div>
            )}
        </span>
    );
}
