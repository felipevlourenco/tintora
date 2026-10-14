import { ButtonHTMLAttributes, useId, useState } from 'react';
import './Select.css';
import { SelectContenxt } from './SelectContext';
import { SelectOption } from './SelectOption';

interface SelectBaseProps<T extends string> extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'role'
> {
    options: readonly SelectOption<T>[];
    /** The trigger shows only the value, so it needs a name. */
    'aria-label': string;
    /** Shown when nothing is selected. */
    placeholder?: string;
    /** Hidden input so the value submits with a <form>. Skip until needed. */
    name?: string;
}

interface ControlledProps<T extends string> {
    value: T | null;
    onValueChange: (value: T) => void;
    defaultValue?: never;
}

interface UncontrolledProps<T extends string> {
    value?: never;
    onValueChange?: (value: T) => void;
    defaultValue: T | null;
}

export type SelectProps<T extends string = string> = SelectBaseProps<T> &
    (ControlledProps<T> | UncontrolledProps<T>);

export function Select<T extends string>({
    defaultValue,
    options,
    disabled,
    value,
    placeholder,
    onValueChange,
    name,
    'aria-label': ariaLabel,
}: SelectProps<T>) {
    const selectId = useId();
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = !!value;
    const selected = (isControlled ? value : internalValue) as T;

    const select = (nextValue: string) => {
        if (nextValue === selected) {
            return;
        }

        if (!isControlled) {
            setInternalValue(nextValue as T);
        }

        onValueChange?.(nextValue as T);
    };

    return (
        <SelectContenxt.Provider value={{ value: selected, select }}>
            <div className="tintora-select">
                <button
                    name={name}
                    aria-label={ariaLabel}
                    popoverTarget={selectId}
                    className="tintora-select__trigger"
                    disabled={disabled}
                >
                    {selected ?? placeholder}
                </button>
                <div
                    id={selectId}
                    popover="auto"
                    role="listbox"
                    className="tintora-select__menu"
                >
                    {options.map((option) => (
                        <SelectOption key={option.value} {...option} />
                    ))}
                </div>
            </div>
        </SelectContenxt.Provider>
    );
}
