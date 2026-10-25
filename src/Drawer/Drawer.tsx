'use client';

import { clsx } from '../utils/clsx';
import {
    useEffect,
    useRef,
    type CSSProperties,
    type DialogHTMLAttributes,
    type ReactNode,
} from 'react';
import { isOutsideElementClicked } from '../utils/outside';
import './Drawer.css';

const toCss = (value: number | string) =>
    typeof value === 'number' ? `${value}px` : value;

type DrawerFrom = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps extends Omit<
    DialogHTMLAttributes<HTMLDialogElement>,
    'open' | 'onClose'
> {
    /** Controlled: the parent owns the state. */
    open: boolean;
    /** Called on a backdrop click and on Esc. */
    onClose: () => void;
    /** The edge it slides in from. @default 'right' */
    from?: DrawerFrom;
    /**
     * Number is px, string passes through (`'50vw'`). Capped at the viewport
     * width, and full width on small screens. @default 400 for left and right,
     * full width for top and bottom
     */
    width?: number | string;
    /**
     * Number is px, string passes through. @default full height for left and
     * right, auto for top and bottom
     */
    height?: number | string;
    children?: ReactNode;
}

// TODO: implement
export function Drawer({
    open,
    from = 'right',
    width,
    height,
    children,
    onClose,
    className,
    ...props
}: DrawerProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
            dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
        } else if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    const style: CSSProperties & {
        '--tintora-drawer-width'?: string | number;
        '--tintora-drawer-height'?: string | number;
    } = {
        ...props.style,
        ...(width !== undefined && { '--tintora-drawer-width': toCss(width) }),
        ...(height !== undefined && {
            '--tintora-drawer-height': toCss(height),
        }),
    };

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <dialog
            {...props}
            ref={ref}
            className={clsx(
                'tintora-drawer',
                `tintora-drawer--from-${from}`,
                className,
            )}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => isOutsideElementClicked(event, onClose)}
            style={style}
        >
            {children}
        </dialog>
    );
}
