'use client';

import { useId, useState, type FieldsetHTMLAttributes } from 'react';
import { clsx } from '../utils/clsx';
import './Rating.css';
import { Star } from './Star';

export interface RatingInputProps extends Omit<
    FieldsetHTMLAttributes<HTMLFieldSetElement>,
    'defaultValue' | 'onChange' | 'children'
> {
    /** The group's name, for assistive tech. Required: it has no visible label. */
    'aria-label': string;
    /** The parent owns the value (0 for none). Pair it with `onValueChange`. */
    value?: number;
    /** Starts here when the component owns the value. @default 0 */
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** @default 5 */
    max?: number;
    /**
     * Each star's accessible name. Set it to translate it.
     * @default '{n} star' / '{n} stars'
     */
    starLabel?: (stars: number) => string;
}

const defaultStarLabel = (n: number) => `${n} ${n === 1 ? 'star' : 'stars'}`;

/**
 * A rating the user sets: a group of radio buttons drawn as stars. The arrow
 * keys move between them, as for any radio group.
 */
export function RatingInput({
    value,
    defaultValue = 0,
    onValueChange,
    max = 5,
    starLabel = defaultStarLabel,
    disabled,
    className,
    ...props
}: RatingInputProps) {
    const name = useId();
    const [internal, setInternal] = useState(defaultValue);
    const current = value ?? internal;

    return (
        <fieldset
            {...props}
            disabled={disabled}
            role="radiogroup"
            className={clsx(
                'tintora-rating-input',
                disabled && 'tintora-rating-input--disabled',
                className,
            )}
        >
            {Array.from({ length: max }, (_, i) => {
                const n = i + 1;
                return (
                    <label
                        key={n}
                        className={clsx(
                            'tintora-rating-input__star',
                            n <= current &&
                                'tintora-rating-input__star--filled',
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={n}
                            aria-label={starLabel(n)}
                            checked={current === n}
                            disabled={disabled}
                            onChange={() => {
                                if (value === undefined) setInternal(n);
                                onValueChange?.(n);
                            }}
                            className="tintora-rating-input__radio"
                        />
                        <Star />
                    </label>
                );
            })}
        </fieldset>
    );
}
