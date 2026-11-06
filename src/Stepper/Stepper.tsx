import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from '../utils/clsx';
import './Stepper.css';

export interface StepperStep {
    label: ReactNode;
}

export interface StepperProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'children'
> {
    /** The steps, in order. With none the stepper renders nothing. */
    steps: StepperStep[];
    /**
     * The index of the current step, from 0. The steps before it are
     * complete and the ones after are upcoming. `steps.length` marks every
     * step complete (and none current); other values are clamped to
     * `0..steps.length`.
     */
    current: number;
    /**
     * The landmark's name. Set it to translate it.
     * @default 'Progress'
     */
    'aria-label'?: string;
    /**
     * Read before a complete step's label, in place of its check mark.
     * Set it to translate it.
     * @default 'Completed'
     */
    completedLabel?: string;
}

/**
 * A progress indicator for a flow such as a checkout: a `<nav>` with an
 * ordered list, one item per step. Complete steps show a check, the current
 * step is `aria-current="step"`, upcoming steps show their number. It is not
 * interactive. On small screens only the current step keeps its label on
 * screen (the same `max-width: 480px` breakpoint as `Drawer`).
 */

export function Stepper({
    steps,
    current,
    completedLabel = 'Completed',
    className,
    'aria-label': ariaLabel = 'Progress',
    ...props
}: StepperProps): ReactNode {
    if (steps.length < 1) {
        return null;
    }

    // The index of the current step. `steps.length` means all are complete.
    const active = Math.min(Math.max(current, 0), steps.length);

    return (
        <nav
            {...props}
            aria-label={ariaLabel}
            className={clsx('tintora-stepper', className)}
        >
            <ol className="tintora-stepper__list">
                {steps.map((step, index) => {
                    const state =
                        index < active
                            ? 'complete'
                            : index === active
                              ? 'current'
                              : 'upcoming';
                    return (
                        <li
                            key={index}
                            className={clsx(
                                'tintora-stepper__step',
                                `tintora-stepper__step--${state}`,
                            )}
                            aria-current={
                                state === 'current' ? 'step' : undefined
                            }
                        >
                            <span
                                className="tintora-stepper__marker"
                                aria-hidden="true"
                            >
                                {state === 'complete' ? <Check /> : index + 1}
                            </span>
                            {state === 'complete' && (
                                <span className="tintora-stepper__status">
                                    {completedLabel}
                                </span>
                            )}
                            <span className="tintora-stepper__label">
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

const Check = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
);
