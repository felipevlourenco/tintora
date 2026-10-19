import clsx from 'clsx';
import { useId, useState, type HTMLAttributes } from 'react';
import { RadioContext } from './RadioContext';

interface RadioGroupBaseProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'defaultValue' | 'onChange'
> {
    /** Names the group for assistive tech, e.g. "Units". Required. */
    'aria-label': string;
    disabled?: boolean;
    /** The input `name` shared by the radios. Generated if omitted. */
    name?: string;
}

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
    (ControlledProps<T> | UncontrolledProps<T>);

export function RadioGroup<T extends string>({
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    name,
    className,
    ...props
}: RadioGroupProps<T>) {
    const generatedName = useId();
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

    return (
        <RadioContext.Provider
            value={{
                name: name ?? generatedName,
                value: selected,
                select,
                disabled,
            }}
        >
            <div
                {...props}
                role="radiogroup"
                className={clsx('tintora-radio-group', className)}
            />
        </RadioContext.Provider>
    );
}
