'use client';

import {
    useEffect,
    useRef,
    useState,
    type ElementType,
    type HTMLAttributes,
    type ReactNode,
} from 'react';
import { Link } from '../Link/Link';
import { clsx } from '../utils/clsx';
import './Breadcrumbs.css';

export interface BreadcrumbItem {
    label: ReactNode;
    /** Where the crumb goes. Without it the crumb is plain text. */
    href?: string;
}

export interface BreadcrumbsProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'children'
> {
    /**
     * The trail, from the root to the current page. The last item is the
     * current page: it is never a link and gets `aria-current="page"`.
     * An empty list renders nothing.
     */
    items: BreadcrumbItem[];
    /**
     * Renders every link as this component, such as a router's `Link`.
     * It receives `href`, `className` and `children`.
     * @default 'a'
     */
    linkAs?: ElementType;
    /**
     * Drawn between crumbs. It is hidden from assistive tech.
     * @default '/'
     */
    separator?: ReactNode;
    /**
     * The landmark's name. Set it to translate it.
     * @default 'Breadcrumb'
     */
    'aria-label'?: string;
    /**
     * The most crumbs to show. A longer trail keeps the first crumb and the
     * last ones, with a button between them that shows the whole trail. Values
     * below 2 count as 2. Without it every crumb is shown.
     */
    maxItems?: number;
    /**
     * The collapsed button's name. Set it to translate it.
     * @default 'Show full path'
     */
    expandLabel?: string;
}

/**
 * A `<nav>` with an ordered list of links to the pages above this one.
 * Uses Tintora's `Link`. A long trail can collapse (`maxItems`), which needs
 * state, so it ships with `'use client'`.
 */

export function Breadcrumbs({
    items,
    linkAs,
    separator,
    maxItems,
    expandLabel = 'Show full path',
    className,
    'aria-label': ariaLabel = 'Breadcrumb',
    ...props
}: BreadcrumbsProps): ReactNode {
    const [expanded, setExpanded] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const focusRevealed = useRef(false);

    // The button disappears when it is clicked: move focus to the first crumb
    // it revealed, so a keyboard user is not dropped at the top of the page.
    useEffect(() => {
        if (expanded && focusRevealed.current) {
            focusRevealed.current = false;
            navRef.current
                ?.querySelector<HTMLElement>('li:nth-child(2) a[href]')
                ?.focus();
        }
    }, [expanded]);

    if (items.length < 1) {
        return null;
    }

    const limit = Math.max(maxItems ?? items.length, 2);
    const collapsed = !expanded && items.length > limit;
    // Rows to draw: a crumb, or `null` for the expand button.
    const rows: (BreadcrumbItem | null)[] = collapsed
        ? [items[0], null, ...items.slice(items.length - (limit - 1))]
        : items;

    return (
        <nav
            {...props}
            ref={navRef}
            aria-label={ariaLabel}
            className={clsx('tintora-breadcrumbs', className)}
        >
            <ol className="tintora-breadcrumbs__list">
                {rows.map((item, index) => (
                    <li key={index} className="tintora-breadcrumbs__item">
                        {item === null ? (
                            <button
                                type="button"
                                aria-label={expandLabel}
                                className="tintora-breadcrumbs__expand"
                                onClick={() => {
                                    focusRevealed.current = true;
                                    setExpanded(true);
                                }}
                            >
                                …
                            </button>
                        ) : index === rows.length - 1 ? (
                            <span aria-current="page">{item.label}</span>
                        ) : (
                            <Link
                                as={linkAs}
                                variant="transparent"
                                href={item.href}
                            >
                                {item.label}
                            </Link>
                        )}
                        {index < rows.length - 1 && (
                            <span
                                aria-hidden="true"
                                className="tintora-breadcrumbs__separator"
                            >
                                {separator ?? '/'}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
