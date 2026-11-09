'use client';

import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { clsx } from '../utils/clsx';
import { useMenuContext } from './MenuContext';

export interface MenuItemProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'role' | 'children' | 'onSelect'
> {
    children: ReactNode;
    /** A decorative icon before the label. It is hidden from assistive tech. */
    icon?: ReactNode;
    /** Called when the item is chosen, by click, Enter or Space. The menu then closes. */
    onSelect?: () => void;
    /** Red, for an action that deletes or cannot be undone. */
    destructive?: boolean;
    /** Skipped by the arrow keys, and does nothing when pressed. */
    disabled?: boolean;
}

/** One action in a `Menu`. */
export function MenuItem({
    children,
    icon,
    onSelect,
    destructive,
    disabled,
    className,
    onClick,
    onMouseEnter,
    ...props
}: MenuItemProps) {
    const menu = useMenuContext();

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (disabled || event.defaultPrevented) return;
        onSelect?.();
        menu.close();
    };

    return (
        <button
            {...props}
            type="button"
            role="menuitem"
            // Roving focus: the menu moves focus with the arrow keys.
            tabIndex={-1}
            aria-disabled={disabled || undefined}
            className={clsx(
                'tintora-menu__item',
                destructive && 'tintora-menu__item--destructive',
                className,
            )}
            onClick={handleClick}
            onMouseEnter={(event) => {
                onMouseEnter?.(event);
                // The pointer and the keyboard share one highlighted item.
                if (!disabled) event.currentTarget.focus();
            }}
        >
            {icon && (
                <span className="tintora-menu__icon" aria-hidden="true">
                    {icon}
                </span>
            )}
            <span className="tintora-menu__label">{children}</span>
        </button>
    );
}

/** A thin line between groups of items. */
export function MenuSeparator() {
    return <div role="separator" className="tintora-menu__separator" />;
}
