'use client';

import {
    cloneElement,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type MouseEvent,
    type ReactElement,
    type ReactNode,
} from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { useOutsidePress } from '../hooks/useOutsidePress';
import { useTopLayerPosition } from '../hooks/useTopLayerPosition';
import { clsx } from '../utils/clsx';
import './Menu.css';
import { MenuContext } from './MenuContext';

export interface MenuProps {
    /**
     * Exactly one focusable element, usually an `IconButton` or a `Button`. It
     * gets `aria-haspopup="menu"`, `aria-expanded` and `aria-controls`, so it
     * must pass unknown props on to a DOM element. Focus returns to it when the
     * menu closes.
     */
    trigger: ReactElement<
        Record<string, unknown> & {
            onClick?: (event: MouseEvent) => void;
            onKeyDown?: (event: KeyboardEvent) => void;
        }
    >;
    /** Names the menu for assistive tech, such as "Order actions". Required. */
    'aria-label': string;
    /** `MenuItem`s, and `MenuSeparator`s between groups. */
    children: ReactNode;
    /**
     * Which edge of the trigger the menu lines up with. Use `end` for a
     * trigger on the right of the page.
     * @default 'start'
     */
    align?: 'start' | 'end';
    /** Called when the menu opens or closes. */
    onOpenChange?: (open: boolean) => void;
    className?: string;
}

const MENU_GAP = 4;
const VIEWPORT_MARGIN = 8;

/**
 * A menu of actions that opens from a button (the "menu button" pattern).
 * Focus moves into the menu: the arrow keys, Home and End move between the
 * items, Enter or Space chooses one, Escape and an outside click close it.
 */
export function Menu({
    trigger,
    'aria-label': ariaLabel,
    children,
    align = 'start',
    onOpenChange,
    className,
}: MenuProps) {
    const id = useId();
    const [open, setOpenState] = useState(false);
    const rootRef = useRef<HTMLSpanElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    // Which item gets focus when the menu opens: ArrowUp opens on the last.
    const [firstFocus, setFirstFocus] = useState<'first' | 'last'>('first');
    const wasOpen = useRef(false);

    const setOpen = (next: boolean) => {
        setOpenState(next);
        onOpenChange?.(next);
    };
    const close = () => setOpen(false);

    useEscapeKey(open, close);
    useOutsidePress(open, rootRef, close);

    const items = () =>
        Array.from(
            menuRef.current?.querySelectorAll<HTMLElement>(
                '[role="menuitem"]:not([aria-disabled="true"])',
            ) ?? [],
        );

    // Under the trigger, or above it when it does not fit.
    const position = useTopLayerPosition(
        open,
        menuRef,
        (): (CSSProperties & Record<`--${string}`, string>) | null => {
            const menu = menuRef.current;
            const anchor = rootRef.current?.firstElementChild;
            if (!menu || !anchor) return null;
            const rect = anchor.getBoundingClientRect();
            // Wide as its content, at least as wide as the trigger (see the
            // --tintora-menu-trigger-width min-width in the CSS).
            const width = Math.max(menu.offsetWidth, rect.width);
            const height = menu.offsetHeight;
            const fitsBelow =
                rect.bottom + MENU_GAP + height <= window.innerHeight;
            const fitsAbove = rect.top - MENU_GAP - height >= 0;
            const left = align === 'end' ? rect.right - width : rect.left;
            return {
                top:
                    fitsBelow || !fitsAbove
                        ? rect.bottom + MENU_GAP
                        : rect.top - MENU_GAP - height,
                left: Math.min(
                    Math.max(left, VIEWPORT_MARGIN),
                    Math.max(
                        VIEWPORT_MARGIN,
                        window.innerWidth - width - VIEWPORT_MARGIN,
                    ),
                ),
                '--tintora-menu-trigger-width': `${rect.width}px`,
            };
        },
        [align, children],
    );

    // Focus moves in once the menu is placed: before that it is hidden, and a
    // hidden element cannot take focus. Placing again (scroll, resize) must not
    // move it, so this depends on being placed, not on the position itself.
    const placed = position !== null;
    useLayoutEffect(() => {
        if (!open || !placed) return;
        const list = items();
        (firstFocus === 'last' ? list[list.length - 1] : list[0])?.focus();
    }, [open, placed, firstFocus]);

    // Back to the trigger when it closes, unless focus already went somewhere
    // else (an outside press on another control, or Tab).
    useEffect(() => {
        if (wasOpen.current && !open) {
            const active = document.activeElement;
            if (!active || active === document.body) {
                rootRef.current?.querySelector<HTMLElement>('*')?.focus();
            }
        }
        wasOpen.current = open;
    }, [open]);

    const handleTriggerClick = (event: MouseEvent) => {
        trigger.props.onClick?.(event);
        if (event.defaultPrevented) return;
        setFirstFocus('first');
        setOpen(!open);
    };

    const handleTriggerKeyDown = (event: KeyboardEvent) => {
        trigger.props.onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        event.preventDefault();
        // Open, focus is already inside the menu, so this only opens it.
        if (open) return;
        setFirstFocus(event.key === 'ArrowUp' ? 'last' : 'first');
        setOpen(true);
    };

    const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Tab') {
            close();
            return;
        }
        const list = items();
        const current = list.indexOf(document.activeElement as HTMLElement);
        let next: number;
        switch (event.key) {
            case 'ArrowDown':
                next = (current + 1) % list.length;
                break;
            case 'ArrowUp':
                next = (current - 1 + list.length) % list.length;
                break;
            case 'Home':
                next = 0;
                break;
            case 'End':
                next = list.length - 1;
                break;
            default:
                return;
        }
        event.preventDefault();
        list[next]?.focus();
    };

    return (
        <MenuContext.Provider value={{ close }}>
            <span ref={rootRef} className="tintora-menu-root">
                {cloneElement(trigger, {
                    'aria-haspopup': 'menu',
                    'aria-expanded': open,
                    'aria-controls': open ? id : undefined,
                    onClick: handleTriggerClick,
                    onKeyDown: handleTriggerKeyDown,
                })}
                {open && (
                    <div
                        id={id}
                        ref={menuRef}
                        role="menu"
                        aria-label={ariaLabel}
                        popover="manual"
                        tabIndex={-1}
                        className={clsx('tintora-menu', className)}
                        style={position ?? { visibility: 'hidden' }}
                        onKeyDown={handleMenuKeyDown}
                    >
                        {children}
                    </div>
                )}
            </span>
        </MenuContext.Provider>
    );
}
