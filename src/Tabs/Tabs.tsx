'use client';

import { clsx } from '../utils/clsx';
import {
    useState,
    type HTMLAttributes,
    type KeyboardEvent,
    type ReactNode,
} from 'react';
import './Tabs.css';
import { TabsContext } from './TabsContext';

interface TabsBaseProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'defaultValue' | 'onChange'
> {
    /** Names the tab list for assistive tech, e.g. "Range". Required. */
    'aria-label': string;
    /** `segmented` is a pill on a tray, `underline` a bar under the row. @default 'segmented' */
    variant?: 'segmented' | 'underline';
    /** `Tab`s. One must match the selected value. */
    children: ReactNode;
}

/** The parent owns the value: it passes `value` and updates it in `onValueChange`. */
interface ControlledProps<T extends string> {
    value: T;
    onValueChange: (value: T) => void;
    defaultValue?: never;
}

/** Tabs owns the value, starting from `defaultValue`. */
interface UncontrolledProps<T extends string> {
    value?: never;
    defaultValue: T;
    onValueChange?: (value: T) => void;
}

/** Exactly one of controlled (`value`) or uncontrolled (`defaultValue`). */
export type TabsProps<T extends string = string> = TabsBaseProps &
    (ControlledProps<T> | UncontrolledProps<T>);

const ARROWS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

/**
 * A row of tabs. One is tabbable at a time; the arrow keys, Home and End move
 * focus and select, skipping disabled tabs. Rendering the panel is up to the
 * parent, from the same value.
 */
export function Tabs<T extends string>({
    value,
    defaultValue,
    onValueChange,
    variant = 'segmented',
    className,
    children,
    onKeyDown,
    ...props
}: TabsProps<T>) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    // The props type guarantees exactly one of the two is set.
    const selected = (isControlled ? value : internalValue) as T;

    const select = (next: string) => {
        if (next === selected) {
            return;
        }

        if (!isControlled) {
            setInternalValue(next as T);
        }

        onValueChange?.(next as T);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);

        if (event.defaultPrevented || !ARROWS.includes(event.key)) {
            return;
        }

        const tabs = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>(
                '[role="tab"]:not(:disabled)',
            ),
        );
        const current = tabs.indexOf(event.target as HTMLButtonElement);

        if (current < 0) {
            return;
        }

        event.preventDefault();
        const last = tabs.length - 1;
        const next =
            event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? last
                  : (current +
                        (event.key === 'ArrowRight' ? 1 : -1) +
                        tabs.length) %
                    tabs.length;

        // Selection follows focus; the click goes through Tab's own handler.
        tabs[next].focus();
        tabs[next].click();
    };

    return (
        <TabsContext.Provider value={{ value: selected, select }}>
            {/* Keys bubble up from the focusable tabs; the list itself is not a tab stop. */}
            {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
            <div
                {...props}
                role="tablist"
                className={clsx(
                    'tintora-tabs',
                    `tintora-tabs--${variant}`,
                    className,
                )}
                onKeyDown={handleKeyDown}
            >
                {children}
            </div>
        </TabsContext.Provider>
    );
}
