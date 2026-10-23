import clsx from 'clsx';
import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Drawer, type DrawerProps } from '../Drawer/Drawer';
import './BottomSheet.css';

export interface BottomSheetProps extends Omit<
    DrawerProps,
    'from' | 'width' | 'height' | 'title'
> {
    /** Names the dialog and shows as its heading. */
    title: ReactNode;
}

/**
 * A Drawer that slides up from the bottom: the mobile version of a popover or
 * menu. A scrim click or Esc closes it. Put `BottomSheetOption`s in it.
 */
export function BottomSheet({
    title,
    children,
    className,
    ...props
}: BottomSheetProps) {
    const titleId = useId();
    return (
        <Drawer
            {...props}
            from="bottom"
            aria-labelledby={titleId}
            className={clsx('tintora-bottom-sheet', className)}
        >
            <span
                className="tintora-bottom-sheet__grabber"
                aria-hidden="true"
            />
            <div id={titleId} className="tintora-bottom-sheet__title">
                {title}
            </div>
            {children}
        </Drawer>
    );
}

export interface BottomSheetOptionProps extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'aria-pressed'
> {
    /** Tints the row and shows a check. @default false */
    selected?: boolean;
}

/** A 48px row for a choice in a `BottomSheet`. */
export function BottomSheetOption({
    selected = false,
    className,
    children,
    ...props
}: BottomSheetOptionProps) {
    return (
        <button
            type="button"
            {...props}
            aria-pressed={selected}
            className={clsx('tintora-bottom-sheet__option', className)}
        >
            <span>{children}</span>
            <svg
                className="tintora-bottom-sheet__check"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
        </button>
    );
}
