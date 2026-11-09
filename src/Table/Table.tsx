import type { ReactNode, TableHTMLAttributes } from 'react';
import { clsx } from '../utils/clsx';
import './Table.css';

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
    /** Native table markup: `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`. */
    children: ReactNode;
    /** The table's title, as a `<caption>`. */
    caption?: ReactNode;
    /** Keeps the caption for assistive tech but hides it on screen. @default false */
    captionHidden?: boolean;
    /** @default 'comfortable' */
    density?: 'comfortable' | 'compact';
    /**
     * Makes the scroll area a labelled, focusable region, so a keyboard user can
     * scroll a table wider than its container. Give it whenever the table can
     * overflow, such as "Orders, scrollable".
     */
    scrollLabel?: string;
}

/**
 * Styles a native table: write the markup yourself, the cells follow. In a
 * cell, `data-align="end"` right-aligns a number. The table scrolls sideways
 * inside its box instead of breaking the page on a small screen.
 *
 * Use `<th scope="col">` in the header and `<th scope="row">` for a row's
 * title, so assistive tech can read each cell with its headings.
 */
export function Table({
    children,
    caption,
    captionHidden = false,
    density = 'comfortable',
    scrollLabel,
    className,
    ...props
}: TableProps) {
    return (
        <div
            className="tintora-table-scroll"
            {...(scrollLabel && {
                role: 'region',
                'aria-label': scrollLabel,
                tabIndex: 0,
            })}
        >
            <table
                {...props}
                className={clsx(
                    'tintora-table',
                    `tintora-table--${density}`,
                    className,
                )}
            >
                {caption && (
                    <caption
                        className={clsx(
                            'tintora-table__caption',
                            captionHidden && 'tintora-table__caption--hidden',
                        )}
                    >
                        {caption}
                    </caption>
                )}
                {children}
            </table>
        </div>
    );
}
