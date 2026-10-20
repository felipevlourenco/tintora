import clsx from 'clsx';
import {
    CSSProperties,
    HTMLAttributes,
    ReactNode,
    useEffect,
    useRef,
} from 'react';
import './Toast.css';
import {
    CloseIcon,
    ErrorIcon,
    InfoIcon,
    SuccessIcon,
    WarningIcon,
} from './ToastIcons';

type ToastStatus = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'role'
> {
    /** The message. */
    children: ReactNode;
    /** Picks the icon and its colour. @default 'info' */
    status?: ToastStatus;
    /** One text button, e.g. Undo or Retry. */
    action?: { label: string; onClick: () => void };
    /**
     * Called by the close button and when `duration` runs out. The parent
     * removes the toast; Toast is controlled, like Modal.
     */
    onDismiss: () => void;
    /** Ms before `onDismiss` fires, paused while hovered or focused. 0 turns auto-dismiss off. @default 5000 */
    duration?: number;
    /** Show the 4px bar for the time left. Needs a `duration`. @default false */
    timerBar?: boolean;
}

const STATUS_ICON_MAP: Record<ToastStatus, ReactNode> = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    info: <InfoIcon />,
    warning: <WarningIcon />,
};

export function Toast({
    status = 'info',
    children,
    action,
    onDismiss,
    duration = 5000,
    timerBar = false,
    className,
}: ToastProps) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTime = useRef(new Date().getTime());
    const remaingTime = useRef<number | null>(null);

    const progressStyle: CSSProperties & {
        '--tintora-toast-animation-duration': string;
    } = {
        '--tintora-toast-animation-duration': `${duration}ms`,
    };

    const onMouseEnterHandler = () => {
        if (timerRef.current) {
            const now = new Date().getTime();
            remaingTime.current = now - startTime.current;

            clearTimeout(timerRef.current);
        }
    };

    const onMouseLeaveHandler = () => {
        if (remaingTime.current && remaingTime.current > 0) {
            timerRef.current = setTimeout(
                () => onDismiss(),
                remaingTime.current,
            );
            remaingTime.current = null;
        }
    };

    useEffect(() => {
        if (timerBar) {
            timerRef.current = setTimeout(() => {
                onDismiss();
            }, duration);

            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                    timerRef.current = null;
                }
            };
        }
    }, [duration, onDismiss, timerBar]);

    return (
        <div
            role="status"
            className={clsx(
                'tintora-toast',
                timerBar && 'tintora-toast--timer',
                className,
            )}
            onMouseEnter={onMouseEnterHandler}
            onMouseLeave={onMouseLeaveHandler}
        >
            {STATUS_ICON_MAP[status]}
            <span className="tintora-toast__message">{children}</span>
            {action && (
                <button
                    className="tintora-toast__action"
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            )}
            <button className="tintora-toast__close" aria-labelledby="Dismiss">
                <CloseIcon />
            </button>
            {timerBar && (
                <span
                    className="tintora-toast__progress"
                    style={progressStyle}
                />
            )}
        </div>
    );
}
