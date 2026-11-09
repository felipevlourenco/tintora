'use client';

import {
    useEffect,
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type CSSProperties,
    type FocusEvent,
    type InputHTMLAttributes,
    type KeyboardEvent,
    type MouseEvent,
} from 'react';
import { useTopLayerPosition } from '../hooks/useTopLayerPosition';
import { SelectContext } from '../Select/SelectContext';
import { SelectOption } from '../Select/SelectOption';
import { clsx } from '../utils/clsx';
import { dropdownTop } from '../utils/placement';
// The field and the popup look like a TextField and a Select's list.
import '../Select/Select.css';
import { RequiredMark } from '../TextField/RequiredMark';
import '../TextField/TextField.css';
import './Combobox.css';

interface ComboboxBaseProps<T extends string> extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'role'
    | 'children'
    | 'list'
> {
    /** Always visible: a combobox is never unlabeled. */
    label: string;
    options: readonly SelectOption<T>[];
    hint?: string;
    /** Replaces the hint and marks the input invalid. */
    error?: string;
    /** Adds a hidden input, so the chosen value submits with a <form>. */
    name?: string;
    /**
     * Shown in the list when nothing matches what was typed.
     * @default 'No results'
     */
    emptyLabel?: string;
}

interface ControlledProps<T extends string> {
    value: T | null;
    onValueChange: (value: T) => void;
    defaultValue?: never;
}

interface UncontrolledProps<T extends string> {
    value?: never;
    onValueChange?: (value: T) => void;
    defaultValue?: T | null;
}

export type ComboboxProps<T extends string = string> = ComboboxBaseProps<T> &
    (ControlledProps<T> | UncontrolledProps<T>);

/** Lower case with the accents removed, so "sao" finds "São Paulo". */
const fold = (text: string) =>
    text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/**
 * A `Select` you can type into: the list narrows to the options that contain
 * what was typed. It still picks from the list only. Text that is not chosen
 * is dropped when focus leaves, and the chosen label comes back.
 */
export function Combobox<T extends string>({
    label,
    options,
    hint,
    error,
    name,
    emptyLabel = 'No results',
    value,
    defaultValue,
    onValueChange,
    id,
    className,
    disabled,
    required,
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    onBlur,
    onClick,
    onKeyDown,
    ...props
}: ComboboxProps<T>) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const listId = `${inputId}-list`;
    const messageId = `${inputId}-message`;
    const message = error ?? hint;
    const inputRef = useRef<HTMLInputElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [internalValue, setInternalValue] = useState(defaultValue ?? null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    // What was typed, or null while the input just shows the chosen label.
    const [query, setQuery] = useState<string | null>(null);

    const isControlled = value !== undefined;
    const selected = (isControlled ? value : internalValue) as T | null;
    const selectedOption = options.find((o) => o.value === selected);

    const filterOptions = (text: string | null) =>
        text
            ? options.filter((o) => fold(o.label).includes(fold(text)))
            : options;
    const shown = filterOptions(query);

    const firstEnabled = (list = shown) => list.findIndex((o) => !o.disabled);
    /** The next enabled option in a direction; stays put at the ends. */
    const step = (from: number, direction: 1 | -1) => {
        for (
            let i = from + direction;
            i >= 0 && i < shown.length;
            i += direction
        ) {
            if (!shown[i].disabled) return i;
        }
        return from;
    };

    const openList = () => {
        if (open) return;
        const index = shown.findIndex(
            (o) => o.value === selected && !o.disabled,
        );
        setActiveIndex(index >= 0 ? index : firstEnabled());
        setOpen(true);
    };
    const closeList = () => {
        setOpen(false);
        setQuery(null);
    };

    const select = (optionValue: string) => {
        const option = shown.find((o) => o.value === optionValue);
        if (!option || option.disabled) return;
        closeList();
        if (optionValue === selected) return;
        if (!isControlled) setInternalValue(optionValue as T);
        onValueChange?.(optionValue as T);
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        setQuery(text);
        setActiveIndex(firstEnabled(filterOptions(text)));
        setOpen(true);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp':
                event.preventDefault();
                if (!open) return openList();
                setActiveIndex(
                    activeIndex < 0
                        ? firstEnabled()
                        : step(activeIndex, event.key === 'ArrowDown' ? 1 : -1),
                );
                return;
            case 'Enter':
                // Closed, Enter belongs to the form.
                if (!open) return;
                event.preventDefault();
                if (activeIndex >= 0) select(shown[activeIndex].value);
                else closeList();
                return;
            case 'Escape':
                if (!open) return;
                event.preventDefault();
                closeList();
        }
    };

    const handleClick = (event: MouseEvent<HTMLInputElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) openList();
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        onBlur?.(event);
        closeList();
    };

    // Under the field, or above it when it does not fit.
    const position = useTopLayerPosition(
        open,
        menuRef,
        (): CSSProperties | null => {
            const menu = menuRef.current;
            const field = inputRef.current;
            if (!menu || !field) return null;
            const rect = field.getBoundingClientRect();
            return {
                top: dropdownTop(rect, menu.offsetHeight),
                left: rect.left,
                minWidth: rect.width,
            };
        },
        [shown.length],
    );

    useEffect(() => {
        if (open && activeIndex >= 0) {
            menuRef.current?.children
                .item(activeIndex)
                ?.scrollIntoView?.({ block: 'nearest' });
        }
    }, [open, activeIndex]);

    const optionId = (optionValue: string) =>
        `${listId}-option-${shown.findIndex((o) => o.value === optionValue)}`;
    const activeValue = open ? (shown[activeIndex]?.value ?? null) : null;
    const listShown = open && shown.length > 0;

    return (
        <SelectContext.Provider
            value={{
                value: selected,
                activeValue,
                select,
                optionId,
                activate: (optionValue) =>
                    setActiveIndex(
                        shown.findIndex((o) => o.value === optionValue),
                    ),
            }}
        >
            <div
                className={clsx(
                    'tintora-textfield',
                    'tintora-combobox',
                    disabled && 'tintora-textfield--disabled',
                    className,
                )}
            >
                <label htmlFor={inputId} className="tintora-textfield__label">
                    {label}
                    <RequiredMark show={required} />
                </label>
                <div className="tintora-combobox__control">
                    <input
                        autoComplete="off"
                        {...props}
                        ref={inputRef}
                        id={inputId}
                        type="text"
                        role="combobox"
                        aria-autocomplete="list"
                        // "Expanded" describes the list. With no match there is
                        // only a message, and nothing for aria-controls to name.
                        aria-expanded={listShown}
                        aria-controls={listShown ? listId : undefined}
                        aria-activedescendant={
                            activeValue === null
                                ? undefined
                                : optionId(activeValue)
                        }
                        aria-invalid={error ? true : ariaInvalid}
                        aria-describedby={
                            clsx(message && messageId, describedBy) || undefined
                        }
                        disabled={disabled}
                        required={required}
                        className="tintora-textfield__input tintora-combobox__input"
                        value={query ?? selectedOption?.label ?? ''}
                        onChange={handleChange}
                        onClick={handleClick}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                    />
                    <svg
                        className="tintora-combobox__chevron"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>

                {open && (
                    // Focus stays in the input; the active option is
                    // aria-activedescendant. With no match there is no list,
                    // only the message.
                    <div
                        ref={menuRef}
                        id={listId}
                        role={shown.length > 0 ? 'listbox' : undefined}
                        aria-label={shown.length > 0 ? label : undefined}
                        popover="manual"
                        className="tintora-select__menu"
                        style={position ?? {}}
                        // Keep focus in the input when clicking an option.
                        onMouseDown={(event) => event.preventDefault()}
                    >
                        {shown.length > 0 ? (
                            shown.map((option) => (
                                <SelectOption key={option.value} {...option} />
                            ))
                        ) : (
                            <div
                                role="status"
                                className="tintora-combobox__empty"
                            >
                                {emptyLabel}
                            </div>
                        )}
                    </div>
                )}

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

                {name && (
                    <input
                        type="hidden"
                        name={name}
                        value={selected ?? ''}
                        disabled={disabled}
                    />
                )}
            </div>
        </SelectContext.Provider>
    );
}
