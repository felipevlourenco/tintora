import clsx from 'clsx';
import type { HTMLAttributes, ReactNode } from 'react';
import './Alert.css';

type AlertStatus = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'title' | 'role'
> {
    /** Colour and icon. Ignored by `announcement`. @default 'info' */
    status?: AlertStatus;
    /** @default 'alert' */
    variant?: 'alert' | 'announcement';
    title?: ReactNode;
    children?: ReactNode;
    /** One text link. Under the body in an `alert`, inline in an `announcement`. */
    action?: { label: string; onClick: () => void };
    /** Shows the dismiss button. */
    onDismiss?: () => void;
}

const ALERT_ICONS: Record<AlertStatus, ReactNode> = {
    info: (
        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01"></path>
    ),
    success: (
        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 12.5l2.7 2.7L16 9.8"></path>
    ),
    warning: (
        <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"></path>
    ),
    error: (
        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM15 9l-6 6M9 9l6 6"></path>
    ),
};

const AlertIcon = ({ status }: Required<Pick<AlertProps, 'status'>>) => (
    <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke={`var(--tintora-status-${status}-fg)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flex: '0 0 auto', marginTop: 1 }}
    >
        {ALERT_ICONS[status]}
    </svg>
);

export function Alert({
    status = 'info',
    variant = 'alert',
    title,
    children,
    action,
    onDismiss,
    className,
    ...props
}: AlertProps) {
    return (
        <div
            {...props}
            role={
                variant === 'alert' && status === 'error' ? 'alert' : 'status'
            }
            className={clsx(
                'tintora-alert',
                variant === 'announcement'
                    ? 'tintora-alert--announcement'
                    : `tintora-alert--${status}`,
                className,
            )}
        >
            {variant === 'alert' && <AlertIcon status={status} />}
            <div
                className={clsx(
                    'tintora-alert__content',
                    variant === 'announcement' &&
                        `tintora-alert__content--announcement`,
                )}
            >
                {title && (
                    <span className="tintora-alert__content__title">
                        {title}
                    </span>
                )}
                {children && (
                    <span className="tintora-alert__content__sub-title">
                        {children}
                    </span>
                )}
                {action && (
                    <button
                        type="button"
                        onClick={action.onClick}
                        className={clsx(
                            'tintora-alert__content__action',
                            variant === 'alert' &&
                                `tintora-alert__content__action--${status}`,
                        )}
                    >
                        {action.label}
                    </button>
                )}
            </div>
            {variant === 'alert' && onDismiss && (
                <button
                    type="button"
                    aria-label="Dismiss"
                    className="tintora-alert__close"
                    onClick={onDismiss}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        aria-hidden="true"
                    >
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            )}
        </div>
    );
}
