'use client';

import { useId, type TextareaHTMLAttributes } from 'react';
import { clsx } from '../utils/clsx';
import '../TextField/TextField.css';
import './Textarea.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Always visible: a text area is never unlabeled. */
    label: string;
    hint?: string;
    /** Replaces the hint and marks the field invalid. */
    error?: string;
}

/**
 * A labelled multi-line field, styled like `TextField` and sharing its label,
 * hint and error. It is resizable vertically.
 */
export function Textarea({
    label,
    hint,
    error,
    id,
    className,
    disabled,
    rows = 4,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    ...props
}: TextareaProps) {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const messageId = `${fieldId}-message`;
    const message = error ?? hint;

    return (
        <div
            className={clsx(
                'tintora-textfield',
                'tintora-textarea',
                disabled && 'tintora-textfield--disabled',
                className,
            )}
        >
            <label htmlFor={fieldId} className="tintora-textfield__label">
                {label}
            </label>
            <textarea
                {...props}
                id={fieldId}
                rows={rows}
                disabled={disabled}
                className="tintora-textfield__input tintora-textarea__field"
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
