import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import './SearchInput.css';

export interface SearchInputProps extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'aria-label'
> {
    /** There is no visible label, so an accessible name is required. */
    'aria-label': string;
}

export function SearchInput({
    className,
    disabled,
    ...props
}: SearchInputProps) {
    return (
        // The wrapper is a label, so clicking the icon or padding focuses the input.
        <label
            className={clsx(
                'tintora-search-input',
                disabled && 'tintora-search-input--disabled',
                className,
            )}
        >
            <svg
                className="tintora-search-input__icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
            >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
                {...props}
                type="search"
                disabled={disabled}
                className="tintora-search-input__input"
            />
        </label>
    );
}
