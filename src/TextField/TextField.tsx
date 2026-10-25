'use client';

import { clsx } from '../utils/clsx';
import { useId, type InputHTMLAttributes } from 'react';
import './TextField.css';

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Always visible: a text field is never unlabeled. */
    label: string;
    hint?: string;
    /** Replaces the hint and marks the input invalid. */
    error?: string;
}

export function TextField({
    label,
    hint,
    error,
    id,
    className,
    disabled,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    ...props
}: TextFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const messageId = `${inputId}-message`;
    const message = error ?? hint;

    return (
        <div
            className={clsx(
                'tintora-textfield',
                disabled && 'tintora-textfield--disabled',
                className,
            )}
        >
            <label htmlFor={inputId} className="tintora-textfield__label">
                {label}
            </label>
            <input
                {...props}
                id={inputId}
                disabled={disabled}
                className="tintora-textfield__input"
                aria-invalid={error ? true : ariaInvalid}
                aria-describedby={
                    clsx(message && messageId, describedBy) || undefined
                }
            />
            {message && (
                <span
                    id={messageId}
                    className={clsx(
                        'tintora-textfield__hint',
                        error && 'tintora-textfield__hint--error',
                    )}
                >
                    {message}
                </span>
            )}
        </div>
    );
}
