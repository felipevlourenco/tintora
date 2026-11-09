'use client';

import { useState, type InputHTMLAttributes } from 'react';
import { clsx } from '../utils/clsx';
import './Slider.css';

export interface SliderProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'size'
> {
    /** The parent owns the value. Pair it with `onValueChange`. */
    value?: number;
    /** Starts here when the component owns the value. @default `min` */
    defaultValue?: number;
    onValueChange?: (value: number) => void;
    /** @default 0 */
    min?: number;
    /** @default 100 */
    max?: number;
    /** @default 1 */
    step?: number;
    /** The slider's accessible name. There is no visible label. */
    'aria-label': string;
    /**
     * Shows the value next to the slider, formatted by this function, such as
     * `(v) => '$' + v`. It is read out as the slider's value text too.
     */
    formatValue?: (value: number) => string;
}

/**
 * A native `<input type="range">` with the filled part of the track drawn in
 * the accent. One thumb; for a price range use two sliders.
 */
export function Slider({
    value,
    defaultValue,
    onValueChange,
    min = 0,
    max = 100,
    step = 1,
    formatValue,
    className,
    style,
    disabled,
    ...props
}: SliderProps) {
    const [internal, setInternal] = useState(defaultValue ?? min);
    const current = value ?? internal;
    const percent = max > min ? ((current - min) / (max - min)) * 100 : 0;
    const text = formatValue?.(current);

    return (
        <span
            className={clsx(
                'tintora-slider',
                disabled && 'tintora-slider--disabled',
                className,
            )}
        >
            <input
                {...props}
                type="range"
                min={min}
                max={max}
                step={step}
                value={current}
                disabled={disabled}
                aria-valuetext={text}
                className="tintora-slider__input"
                style={
                    {
                        ...style,
                        '--tintora-slider-percent': `${percent}%`,
                    } as React.CSSProperties
                }
                onChange={(event) => {
                    const next = Number(event.target.value);
                    if (value === undefined) setInternal(next);
                    onValueChange?.(next);
                }}
            />
            {text !== undefined && (
                <output className="tintora-slider__value">{text}</output>
            )}
        </span>
    );
}
