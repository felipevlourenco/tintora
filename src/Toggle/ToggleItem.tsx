import clsx from 'clsx';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { useToggleContext } from './ToggleContext';

export type ToggleItemProps<T extends string = string> = Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'value' | 'children'
> & { value: T } & (
        | { children: string; 'aria-label'?: string } // has text: it names the button
        | { children: ReactNode; 'aria-label': string } // icon, or icon plus text: a name is required
    );

export function ToggleItem<T extends string>({
    value,
    children,
    className,
    disabled,
    onClick,
    ...props
}: ToggleItemProps<T>) {
    const toggle = useToggleContext();

    const onClickHandler = (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (!event.defaultPrevented) {
            toggle.select(value);
        }
    };

    return (
        <button
            {...props}
            type="button"
            className={clsx('tintora-toggle__item', className)}
            aria-pressed={toggle.value === value}
            disabled={disabled || toggle.disabled}
            onClick={onClickHandler}
        >
            {children}
        </button>
    );
}
