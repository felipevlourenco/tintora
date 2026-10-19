import { useState, type ChangeEvent } from 'react';

/** The parent owns the state: it passes `checked` and updates it in `onCheckedChange`. */
interface ControlledProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    defaultChecked?: never;
}

/** The component owns the state, starting from `defaultChecked` (off if omitted). */
interface UncontrolledProps {
    checked?: never;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

/** Exactly one of controlled (`checked`) or uncontrolled (`defaultChecked`). */
export type CheckedStateProps = ControlledProps | UncontrolledProps;

/** Shared controlled/uncontrolled `checked` handling for Switch and Checkbox. */
export function useCheckedState({
    checked,
    defaultChecked = false,
    onCheckedChange,
}: CheckedStateProps) {
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isControlled = checked !== undefined;

    return {
        checked: isControlled ? checked : internalChecked,
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
            if (!isControlled) setInternalChecked(event.target.checked);
            onCheckedChange?.(event.target.checked);
        },
    };
}
