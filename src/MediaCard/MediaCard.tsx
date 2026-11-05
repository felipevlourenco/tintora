import {
    useId,
    type CSSProperties,
    type HTMLAttributes,
    type ReactNode,
} from 'react';
import { clsx } from '../utils/clsx';
import './MediaCard.css';

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

export interface MediaCardProps extends Omit<
    HTMLAttributes<HTMLElement>,
    'title'
> {
    /**
     * The element to render. Use `li` for a card inside a `<ul>` grid.
     * @default 'article'
     */
    as?: 'article' | 'div' | 'li';
    /** The picture or illustration. The consumer supplies the `alt`. */
    media: ReactNode;
    /**
     * CSS `aspect-ratio` of the media box, so a grid of cards lines up
     * whatever the image size.
     * @default '5 / 4'
     */
    mediaAspectRatio?: string;
    /** Overlaid on the media, top left. A `Tag`, usually. */
    badge?: ReactNode;
    /** Overlaid on the media, top right. A favourite `IconButton`, say. */
    action?: ReactNode;
    /** A short line above the title, such as a category. */
    eyebrow?: ReactNode;
    /**
     * Rendered inside the heading. Put a `Link` here to make the whole card
     * clickable (see the stretched link in the CSS), without nesting the
     * `action` and `footer` buttons inside an anchor.
     */
    title: ReactNode;
    /**
     * Heading level of the title, so the card fits the page outline.
     * @default 3
     */
    headingLevel?: HeadingLevel;
    /** A line under the title: a rating, a description, a size. */
    meta?: ReactNode;
    /** The bottom row: a price on the left and a button on the right. */
    footer?: ReactNode;
}

/**
 * A vertical card with a media box, a title and optional extras. Nothing in
 * it is shop-specific: every part is a slot, so it also fits recipes,
 * articles or people.
 */

export function MediaCard({
    as: Element = 'article',
    headingLevel,
    title,
    eyebrow,
    media,
    meta,
    footer,
    badge,
    action,
    className,
    mediaAspectRatio = '5 / 4',
    ...props
}: MediaCardProps): ReactNode {
    const id = useId();
    const Heading = `h${headingLevel ?? 3}` as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    const ratio: CSSProperties & { '--tintora-media-card-ratio': string } = {
        '--tintora-media-card-ratio': mediaAspectRatio,
    };

    return (
        <Element
            aria-labelledby={id}
            data-testid="card"
            className={clsx('tintora-media-card', className)}
            {...props}
        >
            <div className="tintora-media-card__media" style={ratio}>
                {media}
                {badge && (
                    <div className="tintora-media-card__badge">{badge}</div>
                )}
                {action && (
                    <div className="tintora-media-card__action">{action}</div>
                )}
            </div>
            <div className="tintora-media-card__details">
                {eyebrow && (
                    <span className="tintora-media-card__eyebrow">
                        {eyebrow}
                    </span>
                )}
                <Heading id={id} className="tintora-media-card__title">
                    {title}
                </Heading>
                {meta && (
                    <span className="tintora-media-card__meta">{meta}</span>
                )}
            </div>
            {footer && (
                <div className="tintora-media-card__footer">{footer}</div>
            )}
        </Element>
    );
}
