import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { MediaCardSkeleton } from './MediaCardSkeleton';

const setup = (props = {}) =>
    render(<MediaCardSkeleton data-testid="card" {...props} />);

describe('MediaCardSkeleton', () => {
    it('is a div with the MediaCard classes, so it has the same size', () => {
        setup();
        const card = screen.getByTestId('card');
        expect(card.tagName).toBe('DIV');
        expect(card).toHaveClass(
            'tintora-media-card',
            'tintora-media-card--loading',
        );
    });

    it('has the same parts as a MediaCard', () => {
        const { container } = setup();
        for (const part of ['media', 'details', 'footer']) {
            expect(
                container.querySelector(`.tintora-media-card__${part}`),
            ).toBeInTheDocument();
        }
    });

    it('is marked busy', () => {
        setup();
        expect(screen.getByTestId('card')).toHaveAttribute('aria-busy', 'true');
    });

    it('is on the light surface in both themes, like MediaCard', () => {
        setup();
        expect(screen.getByTestId('card')).toHaveAttribute(
            'data-theme',
            'light',
        );
    });

    it('has no text, links, buttons or headings', () => {
        setup();
        expect(screen.getByTestId('card')).toHaveTextContent('');
        expect(screen.queryByRole('link')).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
        expect(screen.queryByRole('heading')).toBeNull();
    });

    it('shimmers with Skeleton placeholders', () => {
        const { container } = setup();
        expect(
            container.querySelectorAll('.tintora-skeleton').length,
        ).toBeGreaterThanOrEqual(4);
    });

    it('takes the media ratio from the prop, defaulting to 5 / 4', () => {
        const { container, unmount } = setup();
        const ratio = () =>
            container
                .querySelector<HTMLElement>('.tintora-media-card__media')!
                .style.getPropertyValue('--tintora-media-card-ratio');
        expect(ratio()).toBe('5 / 4');
        unmount();
        const second = render(<MediaCardSkeleton mediaAspectRatio="1 / 1" />);
        expect(
            second.container
                .querySelector<HTMLElement>('.tintora-media-card__media')!
                .style.getPropertyValue('--tintora-media-card-ratio'),
        ).toBe('1 / 1');
    });

    it('renders as a list item in a grid list', () => {
        render(
            <ul>
                <MediaCardSkeleton as="li" />
            </ul>,
        );
        expect(screen.getByRole('listitem')).toHaveClass('tintora-media-card');
    });

    it('keeps the consumer className and passes attributes through', () => {
        setup({ className: 'custom', id: 'loading-1' });
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('tintora-media-card', 'custom');
        expect(card).toHaveAttribute('id', 'loading-1');
    });

    it('does not leak its props to the DOM', () => {
        setup({ mediaAspectRatio: '1 / 1' });
        expect(screen.getByTestId('card')).not.toHaveAttribute(
            'mediaaspectratio',
        );
    });

    it('has no accessibility violations, alone or in a list', async () => {
        const { container } = render(
            <ul>
                <MediaCardSkeleton as="li" />
                <MediaCardSkeleton as="li" />
            </ul>,
        );
        await expectNoA11yViolations(container);
    });
});
