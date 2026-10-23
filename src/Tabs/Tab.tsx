import clsx from 'clsx';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { useTabsContext } from './TabsContext';

export interface TabProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'value' | 'role'
> {
    /** Identifies the tab; matched against the `Tabs` value. */
    value: string;
}

export function Tab({
    value,
    className,
    onClick,
    children,
    ...props
}: TabProps) {
    const tabs = useTabsContext();
    const selected = tabs.value === value;

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
            tabs.select(value);
        }
    };

    return (
        <button
            {...props}
            type="button"
            role="tab"
            aria-selected={selected}
            // Roving tabindex: the row is one stop, the arrows move within it.
            tabIndex={selected ? 0 : -1}
            className={clsx('tintora-tab', className)}
            onClick={handleClick}
        >
            {children}
        </button>
    );
}
