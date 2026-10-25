'use client';

import { clsx } from '../utils/clsx';
import { useId } from 'react';
import './ProgressBar.css';

interface ProgressBarDeterminate {
    /** 0-100. Out-of-range values are clamped. */
    progress: number;
    indeterminate?: never;
}

interface ProgressBarIndeterminate {
    progress?: never;
    indeterminate: true;
}

// A progressbar needs an accessible name: a visible title or an aria-label.
interface ProgressBarTitled {
    title: string;
    'aria-label'?: never;
}

interface ProgressBarLabelled {
    title?: never;
    'aria-label': string;
}

export type ProgressBarProps = (
    ProgressBarDeterminate | ProgressBarIndeterminate
) &
    (ProgressBarTitled | ProgressBarLabelled) & {
        /** Text shown next to the title. Defaults to "80%" or "Indeterminate". */
        valueLabel?: string;
        className?: string;
    };

export function ProgressBar({
    title,
    progress,
    indeterminate,
    valueLabel,
    className,
    'aria-label': ariaLabel,
}: ProgressBarProps) {
    const titleId = useId();
    const percent = indeterminate
        ? undefined
        : Math.min(100, Math.max(0, Number.isFinite(progress) ? progress : 0));
    const complete = percent === 100;
    const value =
        valueLabel ?? (indeterminate ? 'Indeterminate' : `${percent}%`);

    return (
        <div className={clsx('tintora-progress-bar', className)}>
            {title && (
                <div className="tintora-progress-bar__header">
                    <span id={titleId}>{title}</span>
                    <span className="tintora-progress-bar__value">{value}</span>
                </div>
            )}
            <div
                role="progressbar"
                aria-label={ariaLabel}
                aria-labelledby={title ? titleId : undefined}
                aria-valuemin={indeterminate ? undefined : 0}
                aria-valuemax={indeterminate ? undefined : 100}
                aria-valuenow={percent}
                aria-valuetext={valueLabel}
                className="tintora-progress-bar__track"
            >
                <div
                    className={clsx('tintora-progress-bar__fill', {
                        'tintora-progress-bar__fill--indeterminate':
                            indeterminate,
                        'tintora-progress-bar__fill--complete': complete,
                    })}
                    style={
                        percent === undefined
                            ? undefined
                            : { width: `${percent}%` }
                    }
                />
            </div>
        </div>
    );
}
