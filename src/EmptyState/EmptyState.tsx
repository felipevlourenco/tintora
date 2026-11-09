import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from '../utils/clsx';
import './EmptyState.css';

export interface EmptyStateProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'title'
> {
    /** A decorative picture or icon above the title. It is hidden from assistive tech. */
    icon?: ReactNode;
    /** What is missing, such as "Your cart is empty". */
    title: ReactNode;
    /** One line on why, or what to do next. */
    description?: ReactNode;
    /** The next step: a `Button` or a `Link`. */
    action?: ReactNode;
    /**
     * Heading level of the title, so it fits the page outline.
     * @default 2
     */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

/** The placeholder for a list, cart or search with nothing in it. */
export function EmptyState({
    icon,
    title,
    description,
    action,
    headingLevel = 2,
    className,
    ...props
}: EmptyStateProps) {
    const Heading = `h${headingLevel}` as
        'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    return (
        <div {...props} className={clsx('tintora-empty-state', className)}>
            {icon && (
                <div className="tintora-empty-state__icon" aria-hidden="true">
                    {icon}
                </div>
            )}
            <Heading className="tintora-empty-state__title">{title}</Heading>
            {description && (
                <p className="tintora-empty-state__description">
                    {description}
                </p>
            )}
            {action && (
                <div className="tintora-empty-state__action">{action}</div>
            )}
        </div>
    );
}
