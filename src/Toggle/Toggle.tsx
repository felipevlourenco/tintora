import clsx from 'clsx';
import {
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type ReactElement,
} from 'react';
import './Toggle.css';
import { ToggleContext } from './ToggleContext';
import type { ToggleItemProps } from './ToggleItem';

interface ToggleBaseProps<T extends string> extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'defaultValue' | 'onChange'
> {
    /** Names the group for assistive tech, e.g. "Theme". Required. */
    'aria-label': string;

    disabled?: boolean;

    /** Exactly two items. */
    children: [
        ReactElement<ToggleItemProps<T>>,
        ReactElement<ToggleItemProps<T>>,
    ];
}

/** The parent owns the value: it passes `value` and updates it in `onValueChange`. */
interface ControlledProps<T extends string> {
    value: T;
    onValueChange: (value: T) => void;
    defaultValue?: never;
}

/** The Toggle owns the value, starting from `defaultValue`. */
interface UncontrolledProps<T extends string> {
    value?: never;
    defaultValue: T;
    onValueChange?: (value: T) => void;
}

/** Exactly one of controlled (`value`) or uncontrolled (`defaultValue`). */
export type ToggleProps<T extends string = string> = ToggleBaseProps<T> &
    (ControlledProps<T> | UncontrolledProps<T>);

export function Toggle<T extends string>({
    children,
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    className,
    ...props
}: ToggleProps<T>) {
    const [internalValue, setInternalValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    // The props type guarantees exactly one of the two is set.
    const selected = (isControlled ? value : internalValue) as T;
    const index = children.findIndex((child) => child.props.value === selected);
    const toggleRef = useRef<HTMLDivElement | null>(null);
    const [thumb, setThumb] = useState({ x: 0, width: 0 });

    // The thumb sits on the selected item, whatever the items' widths are.
    // Measure it, and again whenever the group resizes (e.g. a web font loads).
    useLayoutEffect(() => {
        const toggle = toggleRef.current;

        if (!toggle) {
            return;
        }

        const measure = () => {
            const item = toggle.children.item(index) as HTMLElement | null;

            if (!item) {
                return;
            }

            const next = { x: item.offsetLeft, width: item.offsetWidth };
            setThumb((prev) =>
                prev.x === next.x && prev.width === next.width ? prev : next,
            );
        };

        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(toggle);

        return () => {
            observer.disconnect();
        };
    }, [index]);

    const thumbStyle: CSSProperties & {
        '--tintora-toggle-thumb-x': string;
        '--tintora-toggle-thumb-width': string;
    } = {
        '--tintora-toggle-thumb-x': `${thumb.x}px`,
        '--tintora-toggle-thumb-width': `${thumb.width}px`,
    };

    const select = (next: string) => {
        if (next === selected) {
            return;
        }

        if (!isControlled) {
            setInternalValue(next as T);
        }

        onValueChange?.(next as T);
    };

    return (
        <ToggleContext.Provider value={{ value: selected, select, disabled }}>
            <div
                {...props}
                role="group"
                ref={toggleRef}
                className={clsx(
                    'tintora-toggle',
                    disabled && 'tintora-toggle--disabled',
                    className,
                )}
            >
                {children}
                <span
                    aria-hidden="true"
                    className="tintora-toggle__thumb"
                    style={thumbStyle}
                />
            </div>
        </ToggleContext.Provider>
    );
}
