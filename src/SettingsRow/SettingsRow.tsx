import { clsx } from '../utils/clsx';
import type { HTMLAttributes, ReactNode } from 'react';
import './SettingsRow.css';

export interface SettingsRowProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'title'
> {
    /** The setting's name. */
    title: ReactNode;
    /** A line under the title, e.g. the current value. */
    description?: ReactNode;
    /** The control: a `Switch`, a `RadioGroup`, a `Select`. */
    children?: ReactNode;
    /**
     * `end` pushes the control to the right edge; `start` puts it right after
     * the title, for a group of options. @default 'end'
     */
    controlPosition?: 'end' | 'start';
}

/**
 * A row for one setting. It is layout only: the control inside still needs its
 * own accessible name (e.g. `aria-label` on a `Switch`).
 */
export function SettingsRow({
    title,
    description,
    children,
    controlPosition = 'end',
    className,
    ...props
}: SettingsRowProps) {
    return (
        <div
            {...props}
            className={clsx(
                'tintora-settings-row',
                `tintora-settings-row--control-${controlPosition}`,
                description && 'tintora-settings-row--described',
                className,
            )}
        >
            <div className="tintora-settings-row__text">
                <div className="tintora-settings-row__title">{title}</div>
                {description && (
                    <div className="tintora-settings-row__description">
                        {description}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}
