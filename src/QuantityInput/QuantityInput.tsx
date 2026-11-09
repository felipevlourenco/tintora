'use client';

import {
    useState,
    type ChangeEvent,
    type HTMLAttributes,
    type KeyboardEvent,
} from 'react';
import { IconButton } from '../IconButton/IconButton';
import { clsx } from '../utils/clsx';
import './QuantityInput.css';

export interface QuantityInputProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'defaultValue' | 'onChange' | 'children'
> {
    /** The parent owns the value. Pair it with `onValueChange`. */
    value?: number;
    /** Starts here when the component owns the value. @default `min` */
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** @default 0 */
    min?: number;
    /** No upper limit when omitted. */
    max?: number;
    /** How much the buttons add or remove. @default 1 */
    step?: number;
    disabled?: boolean;
    /**
     * The number field's accessible name. Set it to translate it.
     * @default 'Quantity'
     */
    'aria-label'?: string;
    /** @default 'Decrease quantity' */
    decreaseLabel?: string;
    /** @default 'Increase quantity' */
    increaseLabel?: string;
}

const Minus = () => (
    <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M5 12h14" />
    </svg>
);
const Plus = () => (
    <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
    >
        <path d="M12 5v14M5 12h14" />
    </svg>
);

/**
 * A whole number with minus and plus buttons, for a cart. Typing is free; the
 * number is checked (digits only, within `min` and `max`) when the field loses
 * focus or Enter is pressed.
 */
export function QuantityInput({
    value,
    defaultValue,
    onValueChange,
    min = 0,
    max,
    step = 1,
    disabled,
    'aria-label': ariaLabel = 'Quantity',
    decreaseLabel = 'Decrease quantity',
    increaseLabel = 'Increase quantity',
    className,
    ...props
}: QuantityInputProps) {
    const [internal, setInternal] = useState(defaultValue ?? min);
    // What is typed, until it is committed. `null` shows the real value.
    const [draft, setDraft] = useState<string | null>(null);
    const current = value ?? internal;

    const clamp = (n: number) => Math.min(Math.max(n, min), max ?? Infinity);

    const commit = (next: number) => {
        const clamped = clamp(next);
        if (value === undefined) setInternal(clamped);
        if (clamped !== current) onValueChange?.(clamped);
        setDraft(null);
    };

    const commitDraft = () => {
        if (draft === null) return;
        commit(draft === '' ? min : Number(draft));
    };

    return (
        <div
            {...props}
            role="group"
            className={clsx(
                'tintora-quantity',
                disabled && 'tintora-quantity--disabled',
                className,
            )}
        >
            <IconButton
                variant="round"
                size="small"
                aria-label={decreaseLabel}
                icon={<Minus />}
                disabled={disabled || current <= min}
                onClick={() => commit(current - step)}
            />
            <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-label={ariaLabel}
                className="tintora-quantity__input"
                value={draft ?? String(current)}
                disabled={disabled}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setDraft(event.target.value.replace(/\D/g, ''))
                }
                onBlur={commitDraft}
                onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === 'Enter') commitDraft();
                }}
            />
            <IconButton
                variant="round"
                size="small"
                aria-label={increaseLabel}
                icon={<Plus />}
                disabled={disabled || (max !== undefined && current >= max)}
                onClick={() => commit(current + step)}
            />
        </div>
    );
}
