'use client';

import { clsx } from '../utils/clsx';
import {
    MouseEvent,
    useEffect,
    useId,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type CSSProperties,
    type KeyboardEvent,
} from 'react';
import { useOutsidePress } from '../hooks/useOutsidePress';
import { useTopLayerPosition } from '../hooks/useTopLayerPosition';
import './Select.css';
import { SelectContext } from './SelectContext';
import { SelectOption } from './SelectOption';

interface SelectBaseProps<T extends string> extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'role'
> {
    options: readonly SelectOption<T>[];
    /** The trigger shows only the value, so it needs a name. */
    'aria-label': string;
    /** Shown when nothing is selected. */
    placeholder?: string;
    /** Adds a hidden input so the value submits with a <form>. */
    name?: string;
}

interface ControlledProps<T extends string> {
    value: T | null;
    onValueChange: (value: T) => void;
    defaultValue?: never;
}

interface UncontrolledProps<T extends string> {
    value?: never;
    onValueChange?: (value: T) => void;
    defaultValue: T | null;
}

export type SelectProps<T extends string = string> = SelectBaseProps<T> &
    (ControlledProps<T> | UncontrolledProps<T>);

const MENU_GAP = 4;

export function Select<T extends string>({
    defaultValue,
    options,
    disabled,
    value,
    placeholder,
    onValueChange,
    name,
    className,
    onClick,
    onKeyDown,
    onKeyUp,
    'aria-label': ariaLabel,
    ...props
}: SelectProps<T>) {
    const listId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const [internalValue, setInternalValue] = useState(defaultValue ?? null);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);

    const isControlled = value !== undefined;
    const selected = (isControlled ? value : internalValue) as T | null;
    const selectedIndex = options.findIndex((o) => o.value === selected);

    const isEnabled = (index: number) => options[index]?.disabled !== true;
    const firstEnabled = () => options.findIndex((_, i) => isEnabled(i));
    /** The next enabled option in a direction; stays put at the ends. */
    const step = (from: number, direction: 1 | -1) => {
        for (
            let i = from + direction;
            i >= 0 && i < options.length;
            i += direction
        ) {
            if (isEnabled(i)) return i;
        }
        return from;
    };
    const lastEnabled = () => {
        const last = step(options.length, -1);
        return last === options.length ? -1 : last;
    };
    const indexOf = (optionValue: string) =>
        options.findIndex((o) => o.value === optionValue);

    const openMenu = () => {
        setActiveIndex(
            selectedIndex >= 0 && isEnabled(selectedIndex)
                ? selectedIndex
                : firstEnabled(),
        );
        setOpen(true);
    };
    const closeMenu = () => setOpen(false);

    const select = (optionValue: string) => {
        const index = indexOf(optionValue);
        if (index < 0 || !isEnabled(index)) return;
        closeMenu();
        if (optionValue === selected) return;
        if (!isControlled) setInternalValue(optionValue as T);
        onValueChange?.(optionValue as T);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const { key } = event;

        if (key === 'Tab') return closeMenu();

        if (!open) {
            if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) {
                event.preventDefault();
                openMenu();
            }
            return;
        }

        const moves: Record<string, () => number> = {
            ArrowDown: () =>
                activeIndex < 0 ? firstEnabled() : step(activeIndex, 1),
            ArrowUp: () =>
                activeIndex < 0 ? firstEnabled() : step(activeIndex, -1),
            Home: firstEnabled,
            End: lastEnabled,
        };
        if (key in moves) {
            event.preventDefault();
            setActiveIndex(moves[key]());
        } else if (key === 'Enter' || key === ' ') {
            event.preventDefault();
            if (activeIndex >= 0) select(options[activeIndex].value);
            else closeMenu();
        } else if (key === 'Escape') {
            event.preventDefault();
            closeMenu();
        }
    };

    // A button clicks on Space's keyup, but keydown already handled it.
    const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyUp?.(event);
        if (event.key === ' ') event.preventDefault();
    };

    // Under the trigger, or above it when it does not fit.
    const position = useTopLayerPosition(
        open,
        menuRef,
        (): CSSProperties | null => {
            const menu = menuRef.current;
            const trigger = triggerRef.current;
            if (!menu || !trigger) return null;
            const rect = trigger.getBoundingClientRect();
            const height = menu.offsetHeight;
            const fitsBelow =
                rect.bottom + MENU_GAP + height <= window.innerHeight;
            const fitsAbove = rect.top - MENU_GAP - height >= 0;
            return {
                top:
                    fitsBelow || !fitsAbove
                        ? rect.bottom + MENU_GAP
                        : rect.top - MENU_GAP - height,
                left: rect.left,
                minWidth: rect.width,
            };
        },
        [],
    );

    const onClickHandler = (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (event.defaultPrevented) {
            return;
        }

        if (open) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    useOutsidePress(open, rootRef, closeMenu);

    useEffect(() => {
        if (open && activeIndex >= 0) {
            menuRef.current?.children
                .item(activeIndex)
                ?.scrollIntoView?.({ block: 'nearest' });
        }
    }, [open, activeIndex]);

    const optionId = (optionValue: string) =>
        `${listId}-option-${indexOf(optionValue)}`;
    const activeValue = open ? (options[activeIndex]?.value ?? null) : null;
    const label = options[selectedIndex]?.label;

    return (
        <SelectContext.Provider
            value={{
                value: selected,
                activeValue,
                select,
                optionId,
                activate: (optionValue) => setActiveIndex(indexOf(optionValue)),
            }}
        >
            <div ref={rootRef} className="tintora-select">
                <button
                    {...props}
                    ref={triggerRef}
                    type="button"
                    role="combobox"
                    aria-label={ariaLabel}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={open ? listId : undefined}
                    aria-activedescendant={
                        activeValue === null ? undefined : optionId(activeValue)
                    }
                    disabled={disabled}
                    className={clsx('tintora-select__trigger', className)}
                    onClick={onClickHandler}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyUp}
                >
                    <span
                        className={clsx(
                            'tintora-select__value',
                            label === undefined &&
                                'tintora-select__value--placeholder',
                        )}
                    >
                        {label ?? placeholder}
                    </span>
                    <svg
                        className="tintora-select__chevron"
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
                </button>

                {open && (
                    // Focus stays on the trigger; the active option is aria-activedescendant.
                    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
                    <div
                        ref={menuRef}
                        id={listId}
                        role="listbox"
                        aria-label={ariaLabel}
                        popover="manual"
                        className="tintora-select__menu"
                        style={position ?? {}}
                        // Keep focus on the trigger when clicking an option.
                        onMouseDown={(event) => event.preventDefault()}
                    >
                        {options.map((option) => (
                            <SelectOption key={option.value} {...option} />
                        ))}
                    </div>
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
