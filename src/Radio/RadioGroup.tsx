'use client';

import { clsx } from '../utils/clsx';
import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import { RadioContext } from './RadioContext';

interface RadioGroupBaseProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'defaultValue' | 'onChange'
> {
    disabled?: boolean;
    /** The input `name` shared by the radios. Generated if omitted. */
    name?: string;
}

/** A group is named one way: out of sight, or with text on the page. */
type NameProps =
    | {
          /** Names the group for assistive tech, e.g. "Units", when no label is shown. */
          'aria-label': string;
          label?: never;
      }
    | {
          /** Shown above the group, and names it, e.g. "Shipping method". */
          label: ReactNode;
          'aria-label'?: never;
      };

/** The parent owns the value: it passes `value` (`null` for none) and updates it in `onValueChange`. */
interface ControlledProps<T extends string> {
    value: T | null;
    onValueChange: (value: T) => void;
    defaultValue?: never;
}

/** The group owns the value, starting from `defaultValue` (nothing selected if omitted). */
interface UncontrolledProps<T extends string> {
    value?: never;
    defaultValue?: T;
    onValueChange?: (value: T) => void;
}

/** Exactly one of controlled (`value`) or uncontrolled (`defaultValue`). */
export type RadioGroupProps<T extends string = string> = RadioGroupBaseProps &
    NameProps &
    (ControlledProps<T> | UncontrolledProps<T>);

export function RadioGroup<T extends string>({
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    name,
    className,
    label,
    ...props
}: RadioGroupProps<T>) {
    const generatedName = useId();
    const labelId = useId();
    const [internalValue, setInternalValue] = useState<T | null>(
        defaultValue ?? null,
    );
    const isControlled = value !== undefined;
    const selected = isControlled ? value : internalValue;

    const select = (next: string) => {
        if (next === selected) {
            return;
        }

        if (!isControlled) {
            setInternalValue(next as T);
        }

        onValueChange?.(next as T);
    };

    const group = (
        <div
            {...props}
            role="radiogroup"
            aria-labelledby={label ? labelId : undefined}
            className={clsx('tintora-radio-group', className)}
        />
    );

    return (
        <RadioContext.Provider
            value={{
                name: name ?? generatedName,
                value: selected,
                select,
                disabled,
            }}
        >
            {label ? (
                <div className="tintora-radio-field">
                    <span id={labelId} className="tintora-radio-field__label">
                        {label}
                    </span>
                    {group}
                </div>
            ) : (
                group
            )}
        </RadioContext.Provider>
    );
}
