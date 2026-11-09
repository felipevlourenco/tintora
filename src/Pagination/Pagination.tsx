import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { Link } from '../Link/Link';
import { clsx } from '../utils/clsx';
import './Pagination.css';

export interface PaginationProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'children'
> {
    /** The current page, from 1. */
    page: number;
    /** How many pages there are. With 0 or less nothing is rendered. */
    pageCount: number;
    /** Called with the page to go to. The pages are buttons. */
    onPageChange?: (page: number) => void;
    /**
     * Makes the pages links to this address instead of buttons, for a server
     * rendered list where the page is in the URL.
     */
    getHref?: (page: number) => string;
    /** Renders the links as this component, such as a router's `Link`. */
    linkAs?: ElementType;
    /**
     * How many pages show on each side of the current one.
     * @default 1
     */
    siblingCount?: number;
    /**
     * The landmark's name. Set it to translate it.
     * @default 'Pagination'
     */
    'aria-label'?: string;
    /** @default 'Previous page' */
    previousLabel?: string;
    /** @default 'Next page' */
    nextLabel?: string;
    /**
     * Each page's accessible name. Set it to translate it.
     * @default 'Page {n}'
     */
    pageLabel?: (page: number) => string;
}

type Item = number | 'ellipsis';

const range = (from: number, to: number) =>
    Array.from({ length: to - from + 1 }, (_, i) => from + i);

/**
 * The page numbers to show: the first, the last, the current one with its
 * siblings, and an ellipsis where pages are left out. The count of slots is
 * the same wherever the current page is, so the bar does not change width.
 */
function getItems(page: number, count: number, siblings: number): Item[] {
    const slots = siblings * 2 + 5;
    if (count <= slots) return range(1, count);

    const left = Math.max(page - siblings, 1);
    const right = Math.min(page + siblings, count);
    const dotsLeft = left > 2;
    const dotsRight = right < count - 1;
    const edge = siblings * 2 + 3;

    if (!dotsLeft) return [...range(1, edge), 'ellipsis', count];
    if (!dotsRight) return [1, 'ellipsis', ...range(count - edge + 1, count)];
    return [1, 'ellipsis', ...range(left, right), 'ellipsis', count];
}

const Chevron = ({ direction }: { direction: 'left' | 'right' }) => (
    <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
    >
        <path d={direction === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
);

/**
 * A row of page numbers with previous and next. The current page is
 * `aria-current="page"`. With `getHref` the pages are links, otherwise
 * buttons that call `onPageChange`.
 */
export function Pagination({
    page,
    pageCount,
    onPageChange,
    getHref,
    linkAs,
    siblingCount = 1,
    'aria-label': ariaLabel = 'Pagination',
    previousLabel = 'Previous page',
    nextLabel = 'Next page',
    pageLabel = (n) => `Page ${n}`,
    className,
    ...props
}: PaginationProps) {
    if (pageCount < 1) {
        return null;
    }

    const current = Math.min(Math.max(page, 1), pageCount);
    const items = getItems(current, pageCount, Math.max(siblingCount, 0));

    // One control: a link when there is a `getHref`, a button otherwise.
    const control = ({
        target,
        label,
        content,
        kind,
        isCurrent = false,
        disabled = false,
    }: {
        target: number;
        label: string;
        content: ReactNode;
        kind: 'page' | 'edge';
        isCurrent?: boolean;
        disabled?: boolean;
    }) => {
        const classes = clsx(
            'tintora-pagination__control',
            `tintora-pagination__control--${kind}`,
            isCurrent && 'tintora-pagination__control--current',
        );

        if (disabled) {
            // A button can be disabled; a link cannot, so it loses its href.
            return getHref ? (
                <span
                    role="link"
                    aria-disabled="true"
                    aria-label={label}
                    className={clsx(
                        classes,
                        'tintora-pagination__control--disabled',
                    )}
                >
                    {content}
                </span>
            ) : (
                <button
                    type="button"
                    disabled
                    aria-label={label}
                    className={classes}
                >
                    {content}
                </button>
            );
        }

        const common = {
            'aria-label': label,
            'aria-current': isCurrent ? ('page' as const) : undefined,
            className: classes,
        };
        return getHref ? (
            <Link
                {...common}
                as={linkAs}
                variant="transparent"
                href={getHref(target)}
            >
                {content}
            </Link>
        ) : (
            <button
                {...common}
                type="button"
                onClick={() => onPageChange?.(target)}
            >
                {content}
            </button>
        );
    };

    return (
        <nav
            {...props}
            aria-label={ariaLabel}
            className={clsx('tintora-pagination', className)}
        >
            <ul className="tintora-pagination__list">
                <li>
                    {control({
                        target: current - 1,
                        label: previousLabel,
                        content: <Chevron direction="left" />,
                        kind: 'edge',
                        disabled: current === 1,
                    })}
                </li>
                {items.map((item, index) =>
                    item === 'ellipsis' ? (
                        <li
                            key={`ellipsis-${index}`}
                            aria-hidden="true"
                            className="tintora-pagination__ellipsis"
                        >
                            …
                        </li>
                    ) : (
                        <li key={item}>
                            {control({
                                target: item,
                                label: pageLabel(item),
                                content: item,
                                kind: 'page',
                                isCurrent: item === current,
                            })}
                        </li>
                    ),
                )}
                <li>
                    {control({
                        target: current + 1,
                        label: nextLabel,
                        content: <Chevron direction="right" />,
                        kind: 'edge',
                        disabled: current === pageCount,
                    })}
                </li>
            </ul>
        </nav>
    );
}
