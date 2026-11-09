import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Tag } from '../Tag/Tag';
import { expectNoA11yViolations } from '../test-utils';
import {
    MediaCarousel,
    type MediaCarouselItem,
    type MediaCarouselProps,
} from './MediaCarousel';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(
    join(import.meta.dirname, 'MediaCarousel.css'),
    'utf8',
);

const items: MediaCarouselItem[] = [
    {
        id: 'front',
        label: 'Front view',
        media: <img src="/front.png" alt="Lamp, front" />,
        thumbnail: <img src="/front-s.png" alt="" />,
    },
    {
        id: 'side',
        label: 'Side view',
        media: <img src="/side.png" alt="Lamp, side" />,
        thumbnail: <img src="/side-s.png" alt="" />,
    },
    {
        id: 'top',
        label: 'Top view',
        media: <img src="/top.png" alt="Lamp, top" />,
        thumbnail: <img src="/top-s.png" alt="" />,
    },
];

const setup = (props: Partial<MediaCarouselProps> = {}) =>
    render(<MediaCarousel items={items} {...(props as object)} />);

const thumb = (name: string) => screen.getByRole('button', { name });
const prev = () => screen.getByRole('button', { name: 'Previous image' });
const next = () => screen.getByRole('button', { name: 'Next image' });

describe('MediaCarousel', () => {
    describe('structure', () => {
        it('is a region named Gallery', () => {
            setup();
            expect(screen.getByRole('region', { name: 'Gallery' })).toHaveClass(
                'tintora-media-carousel',
            );
        });

        it('takes a translated name', () => {
            setup({ 'aria-label': 'Galerie' });
            expect(
                screen.getByRole('region', { name: 'Galerie' }),
            ).toBeInTheDocument();
        });

        it('keeps the consumer className and passes attributes through', () => {
            setup({ className: 'custom', id: 'gallery' });
            const region = screen.getByRole('region');
            expect(region).toHaveClass('tintora-media-carousel', 'custom');
            expect(region).toHaveAttribute('id', 'gallery');
        });

        it('renders nothing without items', () => {
            const { container } = render(<MediaCarousel items={[]} />);
            expect(container).toBeEmptyDOMElement();
        });

        it('shows the first picture only, in the stage', () => {
            const { container } = setup();
            const stage = container.querySelector(
                '.tintora-media-carousel__stage',
            );
            expect(stage).toContainElement(screen.getByAltText('Lamp, front'));
            expect(screen.queryByAltText('Lamp, side')).toBeNull();
            expect(screen.queryByAltText('Lamp, top')).toBeNull();
        });

        it('announces a picture change politely', () => {
            const { container } = setup();
            expect(
                container.querySelector('.tintora-media-carousel__slide'),
            ).toHaveAttribute('aria-live', 'polite');
        });

        it('overlays the badge on the stage', () => {
            const { container } = setup({ badge: <Tag>New</Tag> });
            expect(
                container.querySelector('.tintora-media-carousel__stage'),
            ).toContainElement(screen.getByText('New'));
        });

        it('has no badge wrapper without a badge', () => {
            const { container } = setup();
            expect(
                container.querySelector('.tintora-media-carousel__badge'),
            ).toBeNull();
        });
    });

    describe('media aspect ratio', () => {
        const stage = (container: HTMLElement) =>
            container.querySelector<HTMLElement>(
                '.tintora-media-carousel__stage',
            )!;

        it('defaults to 8 / 7', () => {
            const { container } = setup();
            expect(
                stage(container).style.getPropertyValue(
                    '--tintora-media-carousel-ratio',
                ),
            ).toBe('8 / 7');
        });

        it('takes the ratio from the prop', () => {
            const { container } = setup({ mediaAspectRatio: '1 / 1' });
            expect(
                stage(container).style.getPropertyValue(
                    '--tintora-media-carousel-ratio',
                ),
            ).toBe('1 / 1');
        });
    });

    describe('thumbnails', () => {
        it('has one button per item, named by its label', () => {
            setup();
            for (const { label } of items) {
                expect(thumb(label)).toBeInTheDocument();
            }
        });

        it('marks the current thumbnail, and only that one', () => {
            setup();
            expect(thumb('Front view')).toHaveAttribute('aria-current', 'true');
            expect(thumb('Side view')).not.toHaveAttribute('aria-current');
            expect(thumb('Top view')).not.toHaveAttribute('aria-current');
        });

        it('shows the thumbnail picture inside its button', () => {
            setup();
            expect(thumb('Side view').querySelector('img')).toHaveAttribute(
                'src',
                '/side-s.png',
            );
        });

        it('falls back to the media when there is no thumbnail', () => {
            render(
                <MediaCarousel
                    items={[
                        {
                            id: 'a',
                            label: 'A',
                            media: <img src="/a.png" alt="" />,
                        },
                        {
                            id: 'b',
                            label: 'B',
                            media: <img src="/b.png" alt="" />,
                        },
                    ]}
                />,
            );
            expect(thumb('B').querySelector('img')).toHaveAttribute(
                'src',
                '/b.png',
            );
        });

        it('shows the picture of a clicked thumbnail', async () => {
            setup();
            await userEvent.click(thumb('Side view'));
            expect(screen.getByAltText('Lamp, side')).toBeInTheDocument();
            expect(screen.queryByAltText('Lamp, front')).toBeNull();
            expect(thumb('Side view')).toHaveAttribute('aria-current', 'true');
            expect(thumb('Front view')).not.toHaveAttribute('aria-current');
        });
    });

    describe('arrows', () => {
        it('has default labels that can be translated', () => {
            setup({ previousLabel: 'Précédente', nextLabel: 'Suivante' });
            expect(
                screen.getByRole('button', { name: 'Précédente' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Suivante' }),
            ).toBeInTheDocument();
        });

        it('goes to the next and the previous picture', async () => {
            setup();
            await userEvent.click(next());
            expect(screen.getByAltText('Lamp, side')).toBeInTheDocument();
            await userEvent.click(next());
            expect(screen.getByAltText('Lamp, top')).toBeInTheDocument();
            await userEvent.click(prev());
            expect(screen.getByAltText('Lamp, side')).toBeInTheDocument();
        });

        it('disables previous on the first picture', () => {
            setup();
            expect(prev()).toBeDisabled();
            expect(next()).toBeEnabled();
        });

        it('disables next on the last picture', () => {
            setup({ defaultValue: 'top' });
            expect(next()).toBeDisabled();
            expect(prev()).toBeEnabled();
        });

        it('has no arrows and no thumbnails for a single picture', () => {
            render(<MediaCarousel items={[items[0]]} />);
            expect(screen.queryByRole('button')).toBeNull();
            expect(screen.getByAltText('Lamp, front')).toBeInTheDocument();
        });
    });

    describe('value', () => {
        it('starts at defaultValue', () => {
            setup({ defaultValue: 'side' });
            expect(screen.getByAltText('Lamp, side')).toBeInTheDocument();
            expect(thumb('Side view')).toHaveAttribute('aria-current', 'true');
        });

        it('reports the id on a thumbnail click and an arrow click', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange });
            await userEvent.click(thumb('Top view'));
            expect(onValueChange).toHaveBeenLastCalledWith('top');
            await userEvent.click(prev());
            expect(onValueChange).toHaveBeenLastCalledWith('side');
            expect(onValueChange).toHaveBeenCalledTimes(2);
        });

        it('does not change by itself when controlled', async () => {
            const onValueChange = vi.fn();
            render(
                <MediaCarousel
                    items={items}
                    value="front"
                    onValueChange={onValueChange}
                />,
            );
            await userEvent.click(next());
            expect(onValueChange).toHaveBeenCalledWith('side');
            expect(screen.getByAltText('Lamp, front')).toBeInTheDocument();
        });

        it('follows the parent when controlled', async () => {
            function Parent() {
                const [value, setValue] = useState('front');
                return (
                    <MediaCarousel
                        items={items}
                        value={value}
                        onValueChange={setValue}
                    />
                );
            }
            render(<Parent />);
            await userEvent.click(thumb('Top view'));
            expect(screen.getByAltText('Lamp, top')).toBeInTheDocument();
            expect(next()).toBeDisabled();
        });
    });

    describe('keyboard', () => {
        it('makes only the current thumbnail tabbable', () => {
            setup({ defaultValue: 'side' });
            expect(thumb('Side view')).toHaveAttribute('tabindex', '0');
            expect(thumb('Front view')).toHaveAttribute('tabindex', '-1');
            expect(thumb('Top view')).toHaveAttribute('tabindex', '-1');
        });

        it('moves to the next thumbnail with ArrowRight, selecting and focusing it', async () => {
            setup();
            thumb('Front view').focus();
            await userEvent.keyboard('{ArrowRight}');
            expect(thumb('Side view')).toHaveFocus();
            expect(thumb('Side view')).toHaveAttribute('aria-current', 'true');
            expect(screen.getByAltText('Lamp, side')).toBeInTheDocument();
        });

        it('moves to the previous thumbnail with ArrowLeft', async () => {
            setup({ defaultValue: 'top' });
            thumb('Top view').focus();
            await userEvent.keyboard('{ArrowLeft}');
            expect(thumb('Side view')).toHaveFocus();
            expect(screen.getByAltText('Lamp, side')).toBeInTheDocument();
        });

        it('jumps to the first and last with Home and End', async () => {
            setup({ defaultValue: 'side' });
            thumb('Side view').focus();
            await userEvent.keyboard('{End}');
            expect(thumb('Top view')).toHaveFocus();
            expect(screen.getByAltText('Lamp, top')).toBeInTheDocument();
            await userEvent.keyboard('{Home}');
            expect(thumb('Front view')).toHaveFocus();
            expect(screen.getByAltText('Lamp, front')).toBeInTheDocument();
        });

        it('stops at the ends instead of wrapping', async () => {
            setup();
            thumb('Front view').focus();
            await userEvent.keyboard('{ArrowLeft}');
            expect(thumb('Front view')).toHaveFocus();
            expect(screen.getByAltText('Lamp, front')).toBeInTheDocument();
        });

        it('reports the new id once per key press', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange });
            thumb('Front view').focus();
            await userEvent.keyboard('{ArrowRight}');
            expect(onValueChange).toHaveBeenCalledOnce();
            expect(onValueChange).toHaveBeenCalledWith('side');
        });

        it('keeps the page from scrolling on a handled key, and ignores other keys', () => {
            setup();
            const front = thumb('Front view');
            expect(fireEvent.keyDown(front, { key: 'ArrowRight' })).toBe(false);
            expect(fireEvent.keyDown(front, { key: 'a' })).toBe(true);
        });

        it('does not react to arrow keys on the arrow buttons', async () => {
            setup();
            next().focus();
            await userEvent.keyboard('{ArrowRight}');
            expect(screen.getByAltText('Lamp, front')).toBeInTheDocument();
        });
    });

    describe('stylesheet', () => {
        it('floats the arrows over the stage, semi-transparent', () => {
            expect(css).toMatch(
                /\.tintora-media-carousel__arrow\s*\{[^}]*position:\s*absolute/,
            );
            expect(css).toMatch(
                /\.tintora-media-carousel__arrow\s*\{[^}]*opacity:/,
            );
        });

        it('puts previous on the left and next on the right', () => {
            expect(css).toMatch(
                /\.tintora-media-carousel__arrow--previous\s*\{[^}]*left:/,
            );
            expect(css).toMatch(
                /\.tintora-media-carousel__arrow--next\s*\{[^}]*right:/,
            );
        });

        it('sizes the stage from the ratio variable', () => {
            expect(css).toMatch(
                /\.tintora-media-carousel__stage\s*\{[^}]*aspect-ratio:\s*var\(--tintora-media-carousel-ratio/,
            );
        });

        it('hides the thumbnails on small screens, like the Drawer breakpoint', () => {
            expect(css).toMatch(
                /@media\s*\(max-width:\s*480px\)\s*\{[^@]*\.tintora-media-carousel__thumbnails\s*\{[^}]*display:\s*none/,
            );
        });
    });

    describe('accessibility', () => {
        it('has no violations', async () => {
            const { container } = setup({ badge: <Tag>New</Tag> });
            await expectNoA11yViolations(container);
        });
    });
});
