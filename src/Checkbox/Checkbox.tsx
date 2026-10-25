'use client';

import { clsx } from '../utils/clsx';
import { useLayoutEffect, useRef, type InputHTMLAttributes } from 'react';
import {
    useCheckedState,
    type CheckedStateProps,
} from '../hooks/useCheckedState';
import './Checkbox.css';

interface CheckboxBaseProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'type'
    | 'className'
    | 'children'
    | 'checked'
    | 'defaultChecked'
    | 'onChange'
> {
    /** Names the checkbox for assistive tech, e.g. "Select all". Required. */
    'aria-label': string;
    /** The "mixed" state, e.g. a select-all with only some children checked. */
    indeterminate?: boolean;
    /** Applied to the outer wrapper; every other prop goes to the input. */
    className?: string;
}

export type CheckboxProps = CheckboxBaseProps & CheckedStateProps;

export function Checkbox({
    checked,
    defaultChecked,
    onCheckedChange,
    indeterminate = false,
    className,
    ...props
}: CheckboxProps) {
    const ref = useRef<HTMLInputElement>(null);
    const state = useCheckedState({
        checked,
        defaultChecked,
        onCheckedChange,
    } as CheckedStateProps);

    // `indeterminate` is a DOM property with no HTML attribute. A click clears
    // it natively, so re-apply after every render to keep the prop in charge.
    useLayoutEffect(() => {
        if (ref.current) ref.current.indeterminate = indeterminate;
    });

    return (
        <span className={clsx('tintora-checkbox', className)}>
            <input
                {...props}
                ref={ref}
                type="checkbox"
                className="tintora-checkbox__input"
                checked={state.checked}
                onChange={state.onChange}
            />
            <span className="tintora-checkbox__box" aria-hidden="true">
                <svg
                    className="tintora-checkbox__check"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                <svg
                    className="tintora-checkbox__dash"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                >
                    <path d="M6 12h12" />
                </svg>
            </span>
        </span>
    );
}
