import clsx from 'clsx';
import {
    useEffect,
    useId,
    useRef,
    type DialogHTMLAttributes,
    type ReactNode,
} from 'react';
import { IconButton } from '../IconButton/IconButton';
import './Modal.css';

type ModalStatus = 'success' | 'error' | 'info' | 'warning';

export interface ModalProps extends Omit<
    DialogHTMLAttributes<HTMLDialogElement>,
    'open' | 'title' | 'onClose' | 'role'
> {
    open: boolean;
    /** Called on Esc, the close button and (for `dialog`) a scrim click. */
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    /** Shown in a tinted circle above the title. */
    icon?: ReactNode;
    /** Tints the icon circle. @default 'info' */
    status?: ModalStatus;
    /** The buttons, laid out right-aligned (stacked when centred). */
    actions?: ReactNode;
    /** Max width: 400 / 520 / 640. @default 'md' */
    size?: 'sm' | 'md' | 'lg';
    /** @default 'start' */
    align?: 'start' | 'center';
    /**
     * `alertdialog` is for confirmations: the scrim does not dismiss it.
     * @default 'dialog'
     */
    role?: 'dialog' | 'alertdialog';
    /** Show the corner close button. @default true */
    closeButton?: boolean;
}

const CloseIcon = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
    >
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

/**
 * A modal over a native `<dialog>`: the browser traps focus, makes the page
 * inert, and returns focus to the trigger on close. Initial focus goes to the
 * first focusable element, or to the one marked `data-autofocus`.
 */
export function Modal({
    open,
    onClose,
    title,
    description,
    icon,
    status = 'info',
    actions,
    size = 'md',
    align = 'start',
    role = 'dialog',
    closeButton = true,
    className,
    children,
    ...props
}: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

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

    return (
        // The scrim click is a pointer shortcut; Esc is the keyboard path.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
        <dialog
            {...props}
            ref={ref}
            role={role}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            className={clsx(
                'tintora-modal',
                `tintora-modal--${size}`,
                align === 'center' && 'tintora-modal--center',
                className,
            )}
            // Esc would close the dialog behind React's back; stay controlled.
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                // A click on the scrim lands on the dialog element itself.
                if (role === 'dialog' && event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            {icon && (
                <span
                    className={clsx(
                        'tintora-modal__icon',
                        `tintora-modal__icon--${status}`,
                    )}
                    aria-hidden="true"
                >
                    {icon}
                </span>
            )}
            <div className="tintora-modal__text">
                <h2 id={titleId} className="tintora-modal__title">
                    {title}
                </h2>
                {description && (
                    <p
                        id={descriptionId}
                        className="tintora-modal__description"
                    >
                        {description}
                    </p>
                )}
            </div>
            {closeButton && (
                <IconButton
                    className="tintora-modal__close"
                    size="medium"
                    aria-label="Close"
                    icon={<CloseIcon />}
                    onClick={onClose}
                />
            )}
            {children}
            {actions && <div className="tintora-modal__actions">{actions}</div>}
        </dialog>
    );
}
