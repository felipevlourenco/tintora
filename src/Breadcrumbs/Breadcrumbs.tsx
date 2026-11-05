import type { ElementType, HTMLAttributes, ReactNode } from 'react';
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
}

/**
 * A `<nav>` with an ordered list of links to the pages above this one.
 * Uses Tintora's `Link`, so it needs no `'use client'`.
 */

export function Breadcrumbs({
    items,
    linkAs: BreadcrumbLink = Link,
    'aria-label': ariaLabel = 'Breadcrumb',
    className,
    ...props
}: BreadcrumbsProps): ReactNode {
    if (items.length < 1) {
        return null;
    }

    return (
        <nav
            {...props}
            aria-label={ariaLabel}
            className={clsx('tintora-breadcrumbs', className)}
        >
            <ol className="tintora-breadcrumbs-list">
                {items.map((item, index) => (
                    <li key={index}>
                        {index === items.length - 1 ? (
                            <span aria-current="page">{item.label}</span>
                        ) : (
                            <BreadcrumbLink
                                href={item.href}
                                className="tintora-link"
                            >
                                {item.label}
                            </BreadcrumbLink>
                        )}
                        {index < items.length - 1 && (
                            <span
                                aria-hidden="true"
                                className="tintora-breadcrumbs__separator"
                            >
                                {props.separator ?? '/'}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}
