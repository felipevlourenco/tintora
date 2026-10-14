import clsx from 'clsx';
import { useSelectContext } from './SelectContext';

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
    disabled?: boolean;
}

export function SelectOption({ label, value, disabled }: SelectOption) {
    const {
        select,
        activate,
        optionId,
        value: selectedValue,
        activeValue,
    } = useSelectContext();

    return (
        // Focus stays on the trigger; the keyboard drives the option through
        // aria-activedescendant, so the option itself is not focusable.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
        <div
            id={optionId(value)}
            role="option"
            aria-selected={selectedValue === value}
            aria-disabled={disabled || undefined}
            className={clsx(
                'tintora-select__option',
                activeValue === value && 'tintora-select__option--active',
            )}
            onClick={() => select(value)}
            onMouseMove={() => !disabled && activate(value)}
        >
            {label}
        </div>
    );
}
