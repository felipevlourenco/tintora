import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import { useRadioContext } from './RadioContext';
import './Radio.css';

export type RadioProps<T extends string = string> = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'type'
    | 'role'
    | 'name'
    | 'value'
    | 'className'
    | 'children'
    | 'checked'
    | 'defaultChecked'
    | 'onChange'
> & {
    value: T;
    /** Names the radio for assistive tech, e.g. "Metric". Required. */
    'aria-label': string;
    /** Applied to the outer wrapper; every other prop goes to the input. */
    className?: string;
};

export function Radio<T extends string>({
    value,
    className,
    disabled,
    ...props
}: RadioProps<T>) {
    const group = useRadioContext();

    return (
        <span className={clsx('tintora-radio', className)}>
            <input
                {...props}
                type="radio"
                className="tintora-radio__input"
                name={group.name}
                value={value}
                checked={group.value === value}
                disabled={disabled || group.disabled}
                onChange={() => group.select(value)}
            />
            <span className="tintora-radio__circle" aria-hidden="true" />
        </span>
    );
}
