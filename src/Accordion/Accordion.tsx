import type { DetailsHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { clsx } from '../utils/clsx';
import './Accordion.css';

export type AccordionProps = HTMLAttributes<HTMLDivElement>;

/** A stack of `AccordionItem`s, drawn as one list with dividers. */
export function Accordion({ className, ...props }: AccordionProps) {
    return <div {...props} className={clsx('tintora-accordion', className)} />;
}

export interface AccordionItemProps extends Omit<
    DetailsHTMLAttributes<HTMLDetailsElement>,
    'title' | 'open'
> {
    /** The always-visible heading. It is the button that opens the panel. */
    title: ReactNode;
    children: ReactNode;
    /** Starts open. After that the user decides. @default false */
    defaultOpen?: boolean;
}

const Chevron = () => (
    <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="tintora-accordion__chevron"
    >
        <path d="M6 9l6 6 6-6" />
    </svg>
);

/**
 * One section: a native `<details>`, so it opens and closes with the
 * keyboard and without JavaScript. Give several items the same `name` and
 * only one stays open at a time (a native feature of recent browsers).
 */
export function AccordionItem({
    title,
    children,
    defaultOpen = false,
    className,
    ...props
}: AccordionItemProps) {
    return (
        <details
            {...props}
            open={defaultOpen || undefined}
            className={clsx('tintora-accordion__item', className)}
        >
            <summary className="tintora-accordion__summary">
                <span className="tintora-accordion__title">{title}</span>
                <Chevron />
            </summary>
            <div className="tintora-accordion__panel">{children}</div>
        </details>
    );
}
