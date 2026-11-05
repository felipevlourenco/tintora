import type { HTMLAttributes, ReactNode } from 'react';

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
    headingLevel?: 2 | 3 | 4 | 5 | 6;
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- remove with the stub
export function MediaCard(props: MediaCardProps): ReactNode {
    // TODO(human): implement. The tests in MediaCard.test.tsx describe the
    // markup, the class names and the stylesheet rules it must produce.
    throw new Error('MediaCard is not implemented yet');
}
