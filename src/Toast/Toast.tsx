import clsx from 'clsx';
import {
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
} from 'react';
import { useLatest } from '../hooks/useLatest';
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
    /** Picks the icon and its colour. */
    status?: ToastStatus;
    /** One text button, e.g. Undo or Retry. */
    action?: { label: string; onClick: () => void };
    /**
     * Called by the close button and when `duration` runs out. The parent
     * removes the toast; Toast is controlled, like Modal.
     */
    onDismiss: () => void;
    /**
     * Ms before `onDismiss` fires. The clock pauses while the toast is hovered
     * or has focus, and resumes with the time that was left. 0 turns
     * auto-dismiss off. @default 5000
     */
    duration?: number;
    /** Show the 4px bar for the time left. Needs a `duration` above 0. @default false */
    timerBar?: boolean;
}

const STATUS_ICON_MAP: Record<ToastStatus, ReactNode> = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    info: <InfoIcon />,
    warning: <WarningIcon />,
};

export function Toast({
    status,
    children,
    action,
    onDismiss,
    duration = 5000,
    timerBar = false,
    className,
    ...props
}: ToastProps) {
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const paused = hovered || focused;

    // A parent that passes an inline callback must not restart the clock.
    const onDismissRef = useLatest(onDismiss);

    const remaining = useRef(duration);
    useEffect(() => {
        remaining.current = duration;
    }, [duration]);

    // Each pause cleans up the timer and keeps what was left of it.
    useEffect(() => {
        if (duration <= 0 || paused) return;
        const startedAt = Date.now();
        const timer = setTimeout(
            () => onDismissRef.current(),
            remaining.current,
        );
        return () => {
            clearTimeout(timer);
            remaining.current -= Date.now() - startedAt;
        };
    }, [duration, paused, onDismissRef]);

    const showBar = timerBar && duration > 0;
    const progressStyle = {
        '--tintora-toast-animation-duration': `${duration}ms`,
    } as CSSProperties;

    return (
        <div
            {...props}
            role="status"
            className={clsx(
                'tintora-toast',
                showBar && 'tintora-toast--timer',
                paused && 'tintora-toast--paused',
                className,
            )}
            onMouseEnter={(event) => {
                props.onMouseEnter?.(event);
                setHovered(true);
            }}
            onMouseLeave={(event) => {
                props.onMouseLeave?.(event);
                setHovered(false);
            }}
            onFocus={(event) => {
                props.onFocus?.(event);
                setFocused(true);
            }}
            onBlur={(event) => {
                props.onBlur?.(event);
                // Focus moving between the toast's own buttons is not a blur.
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setFocused(false);
                }
            }}
        >
            {status && STATUS_ICON_MAP[status]}
            <span className="tintora-toast__message">{children}</span>
            {action && (
                <button
                    type="button"
                    className="tintora-toast__action"
                    onClick={action.onClick}
                >
                    {action.label}
                </button>
            )}
            <button
                type="button"
                className="tintora-toast__close"
                aria-label="Dismiss"
                onClick={onDismiss}
            >
                <CloseIcon />
            </button>
            {showBar && (
                <span
                    className="tintora-toast__progress"
                    style={progressStyle}
                />
            )}
        </div>
    );
}
