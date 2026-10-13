import clsx from 'clsx';
import { useState, type HTMLAttributes, type ReactElement } from 'react';
import './Toggle.css';
import { ToggleContext } from './ToggleContext';
import type { ToggleItemProps } from './ToggleItem';

interface ToggleBaseProps<T extends string> extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'defaultValue' | 'onChange'
> {
    /** Names the group for assistive tech, e.g. "Theme". Required. */
    'aria-label': string;

    disabled?: boolean;

    /** Exactly two items. */
    children: [
        ReactElement<ToggleItemProps<T>>,
        ReactElement<ToggleItemProps<T>>,
    ];
}

/** The parent owns the value: it passes `value` and updates it in `onValueChange`. */
interface ControlledProps<T extends string> {
    value: T;
    onValueChange: (value: T) => void;
    defaultValue?: never;
}

/** The Toggle owns the value, starting from `defaultValue`. */
interface UncontrolledProps<T extends string> {
    value?: never;
    defaultValue: T;
    onValueChange?: (value: T) => void;
}

/** Exactly one of controlled (`value`) or uncontrolled (`defaultValue`). */
export type ToggleProps<T extends string = string> = ToggleBaseProps<T> &
    (ControlledProps<T> | UncontrolledProps<T>);

export function Toggle<T extends string>({
    children,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    className,
    ...props
}: ToggleProps<T>) {
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

    return (
        <ToggleContext.Provider value={{ value: selected, select, disabled }}>
            <div
                {...props}
                role="group"
                className={clsx(
                    'tintora-toggle',
                    disabled && 'tintora-toggle--disabled',
                    className,
                )}
            >
                {children}
            </div>
        </ToggleContext.Provider>
    );
}
