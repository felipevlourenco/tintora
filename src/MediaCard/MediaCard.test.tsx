import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Link } from '../Link/Link';
import { Tag } from '../Tag/Tag';
import { expectNoA11yViolations } from '../test-utils';
import { MediaCard, type MediaCardProps } from './MediaCard';

const setup = (props: Partial<MediaCardProps> = {}) =>
    render(
        <MediaCard
            data-testid="card"
            media={<img src="/lamp.png" alt="Desk lamp" />}
            title="Alder desk lamp"
            {...props}
        />,
    );

// The whole shop-item example: every slot filled, the title a link.
const renderProduct = (onFavourite = vi.fn(), onAdd = vi.fn()) =>
    render(
        <MediaCard
            data-testid="card"
            media={<img src="/lamp.png" alt="Desk lamp" />}
            badge={<Tag variant="accent">New</Tag>}
            action={
                <IconButton
                    aria-label="Add to favourites"
                    icon={<span aria-hidden>♡</span>}
                    onClick={onFavourite}
                />
            }
            eyebrow="Lighting"
            title={
                <Link href="/lamps/alder" variant="transparent">
                    Alder desk lamp
                </Link>
            }
            meta="4.8 (212)"
            footer={
                <>
                    <span>$54.00</span>
                    <Button variant="secondary" size="small" onClick={onAdd}>
                        Add
                    </Button>
                </>
            }
        />,
    );

describe('MediaCard', () => {
    describe('structure', () => {
        it('is an article with the Tintora class by default', () => {
            setup();
            const card = screen.getByTestId('card');
            expect(card.tagName).toBe('ARTICLE');
            expect(card).toHaveClass('tintora-media-card');
        });

        it('renders as a list item inside a grid list', () => {
            render(
                <ul>
                    <MediaCard
                        as="li"
                        media={<img src="/a.png" alt="" />}
                        title="First"
                    />
                </ul>,
            );
            expect(screen.getByRole('listitem')).toHaveClass(
                'tintora-media-card',
            );
        });

        it('renders the media inside the media box', () => {
            const { container } = setup();
            const box = container.querySelector('.tintora-media-card__media');
            expect(box).toContainElement(screen.getByAltText('Desk lamp'));
        });

        it('renders the title in a level 3 heading by default', () => {
            setup();
            expect(
                screen.getByRole('heading', {
                    level: 3,
                    name: 'Alder desk lamp',
                }),
            ).toBeInTheDocument();
        });

        it('lets the heading level fit the page outline', () => {
            setup({ headingLevel: 2 });
            expect(
                screen.getByRole('heading', { level: 2 }),
            ).toBeInTheDocument();
        });

        it('is named by its title', () => {
            setup();
            expect(
                screen.getByRole('article', { name: 'Alder desk lamp' }),
            ).toBe(screen.getByTestId('card'));
        });

        it('renders the eyebrow and the meta line', () => {
            setup({ eyebrow: 'Lighting', meta: '4.8 (212)' });
            expect(screen.getByText('Lighting')).toBeInTheDocument();
            expect(screen.getByText('4.8 (212)')).toBeInTheDocument();
        });

        it('overlays the badge and the action on the media box', () => {
            const { container } = renderProduct();
            const box = container.querySelector('.tintora-media-card__media');
            expect(box).toContainElement(screen.getByText('New'));
            expect(box).toContainElement(
                screen.getByRole('button', { name: 'Add to favourites' }),
            );
        });

        it('renders the footer outside the media box', () => {
            const { container } = renderProduct();
            const box = container.querySelector('.tintora-media-card__media');
            const price = screen.getByText('$54.00');
            expect(box).not.toContainElement(price);
            expect(
                container.querySelector('.tintora-media-card__footer'),
            ).toContainElement(price);
        });

        it.each(['badge', 'action', 'eyebrow', 'meta', 'footer'])(
            'leaves out the %s wrapper when the slot is empty',
            (slot) => {
                const { container } = setup();
                expect(
                    container.querySelector(`.tintora-media-card__${slot}`),
                ).toBeNull();
            },
        );
    });

    describe('media aspect ratio', () => {
        const box = (container: HTMLElement) =>
            container.querySelector<HTMLElement>('.tintora-media-card__media')!;

        it('defaults to 5 / 4', () => {
            const { container } = setup();
            expect(
                box(container).style.getPropertyValue(
                    '--tintora-media-card-ratio',
                ),
            ).toBe('5 / 4');
        });

        it('takes the ratio from the prop', () => {
            const { container } = setup({ mediaAspectRatio: '1 / 1' });
            expect(
                box(container).style.getPropertyValue(
                    '--tintora-media-card-ratio',
                ),
            ).toBe('1 / 1');
        });
    });

    describe('clickable card', () => {
        it('keeps the title link inside the heading', () => {
            renderProduct();
            const heading = screen.getByRole('heading', { level: 3 });
            expect(within(heading).getByRole('link')).toHaveAttribute(
                'href',
                '/lamps/alder',
            );
        });

        it('keeps the buttons out of the link, as nested interactive content is invalid', () => {
            renderProduct();
            const link = screen.getByRole('link');
            expect(link).not.toContainElement(
                screen.getByRole('button', { name: 'Add to favourites' }),
            );
            expect(link).not.toContainElement(
                screen.getByRole('button', { name: 'Add' }),
            );
        });

        it('calls the action and footer buttons, not the card', async () => {
            const onFavourite = vi.fn();
            const onAdd = vi.fn();
            renderProduct(onFavourite, onAdd);
            await userEvent.click(
                screen.getByRole('button', { name: 'Add to favourites' }),
            );
            await userEvent.click(screen.getByRole('button', { name: 'Add' }));
            expect(onFavourite).toHaveBeenCalledOnce();
            expect(onAdd).toHaveBeenCalledOnce();
        });

        it('is reachable by keyboard in reading order: link, favourite, add', async () => {
            renderProduct();
            await userEvent.tab();
            expect(
                screen.getByRole('button', { name: 'Add to favourites' }),
            ).toHaveFocus();
            await userEvent.tab();
            expect(screen.getByRole('link')).toHaveFocus();
            await userEvent.tab();
            expect(screen.getByRole('button', { name: 'Add' })).toHaveFocus();
        });
    });

    describe('props', () => {
        it('keeps the consumer className next to its own', () => {
            setup({ className: 'custom' });
            expect(screen.getByTestId('card')).toHaveClass(
                'tintora-media-card',
                'custom',
            );
        });

        it('passes native attributes through to the element', () => {
            setup({ id: 'lamp', lang: 'sv' });
            expect(screen.getByTestId('card')).toHaveAttribute('id', 'lamp');
            expect(screen.getByTestId('card')).toHaveAttribute('lang', 'sv');
        });

        it('does not leak the slot props to the DOM', () => {
            renderProduct();
            const card = screen.getByTestId('card');
            for (const name of [
                'media',
                'badge',
                'action',
                'eyebrow',
                'meta',
                'footer',
                'headingLevel',
                'mediaAspectRatio',
            ]) {
                expect(card).not.toHaveAttribute(name.toLowerCase());
            }
        });
    });

    describe('accessibility', () => {
        it('has no violations with every slot filled', async () => {
            const { container } = renderProduct();
            await expectNoA11yViolations(container);
        });

        it('has no violations as items of a list', async () => {
            const { container } = render(
                <ul>
                    <MediaCard
                        as="li"
                        media={<img src="/a.png" alt="Brass lamp" />}
                        title="First"
                    />
                    <MediaCard
                        as="li"
                        media={<img src="/b.png" alt="Oak lamp" />}
                        title="Second"
                    />
                </ul>,
            );
            await expectNoA11yViolations(container);
        });
    });
});
