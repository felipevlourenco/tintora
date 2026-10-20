import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import {
    useCheckedState,
    type CheckedStateProps,
} from '../hooks/useCheckedState';
import './Switch.css';

interface SwitchBaseProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'type'
    | 'role'
    | 'className'
    | 'children'
    | 'checked'
    | 'defaultChecked'
    | 'onChange'
> {
    /** Names the switch for assistive tech, e.g. "Wi-Fi". Required. */
    'aria-label': string;
    /** Applied to the outer wrapper; every other prop goes to the input. */
    className?: string;
}

export type SwitchProps = SwitchBaseProps & CheckedStateProps;

export function Switch({
    checked,
    defaultChecked,
    onCheckedChange,
    className,
    ...props
}: SwitchProps) {
    const state = useCheckedState({
        checked,
        defaultChecked,
        onCheckedChange,
    } as CheckedStateProps);

    return (
        <span className={clsx('tintora-switch', className)}>
            <input
                {...props}
                type="checkbox"
                role="switch"
                className="tintora-switch__input"
                checked={state.checked}
                onChange={state.onChange}
            />
            <span className="tintora-switch__track" aria-hidden="true" />
        </span>
    );
}
