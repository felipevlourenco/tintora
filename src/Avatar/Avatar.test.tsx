import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Avatar, type AvatarProps } from './Avatar';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Avatar.css'), 'utf8');

const sizes = { small: 32, medium: 40, large: 44 } as const;
const photo = 'https://example.com/felipe.png';

const setup = (props: Partial<AvatarProps> = {}) =>
    render(<Avatar name="Felipe Lourenco" {...props} />);

const getImage = (container: HTMLElement) => container.querySelector('img');

/** The body of the first rule whose selector is exactly `selector`. */
const rule = (selector: string) =>
    css.match(
        new RegExp(`${selector.replace(/[.>]/g, '\\$&')}\\s*\\{([^}]*)\\}`),
    )?.[1] ?? '';

describe('Avatar', () => {
    describe('initials', () => {
        it('shows the initials of the name', () => {
            setup();
            expect(screen.getByText('FL')).toBeInTheDocument();
        });

        it('shows a single initial for a single name', () => {
            setup({ name: 'Felipe' });
            expect(screen.getByText('F')).toBeInTheDocument();
        });

        it('updates when the name changes', () => {
            const { rerender } = setup();
            rerender(<Avatar name="Alex Moreno" />);
            expect(screen.getByText('AM')).toBeInTheDocument();
            expect(screen.queryByText('FL')).not.toBeInTheDocument();
        });

        it('does not render an <img>', () => {
            const { container } = setup();
            expect(getImage(container)).not.toBeInTheDocument();
        });
    });

    describe('image', () => {
        it('renders the image instead of the initials', () => {
            const { container } = setup({ src: photo });
            expect(getImage(container)).toHaveAttribute('src', photo);
            expect(screen.queryByText('FL')).not.toBeInTheDocument();
        });

        it('treats an empty src as no image', () => {
            const { container } = setup({ src: '' });
            expect(getImage(container)).not.toBeInTheDocument();
            expect(screen.getByText('FL')).toBeInTheDocument();
        });

        it('falls back to the initials when the image fails to load', () => {
            const { container } = setup({ src: photo });
            fireEvent.error(getImage(container)!);
            expect(getImage(container)).not.toBeInTheDocument();
            expect(screen.getByText('FL')).toBeInTheDocument();
        });

        it('tries again when src changes after a failure', () => {
            const { container, rerender } = setup({ src: photo });
            fireEvent.error(getImage(container)!);
            rerender(<Avatar name="Felipe Lourenco" src="/other.png" />);
            expect(getImage(container)).toHaveAttribute('src', '/other.png');
        });

        it('does not repeat the name in the <img> alt text', () => {
            // The wrapper already names the avatar; a second name or a generic
            // "Avatar" would be read out twice.
            const { container } = setup({ src: photo });
            expect(getImage(container)).toHaveAttribute('alt', '');
        });
    });

    describe('accessible name', () => {
        it('is an image named after the person (initials)', () => {
            setup();
            expect(
                screen.getByRole('img', { name: 'Felipe Lourenco' }),
            ).toBeInTheDocument();
        });

        it('is an image named after the person (photo)', () => {
            setup({ src: photo });
            expect(
                screen.getByRole('img', { name: 'Felipe Lourenco' }),
            ).toBeInTheDocument();
        });

        it('exposes exactly one image', () => {
            setup({ src: photo });
            expect(screen.getAllByRole('img')).toHaveLength(1);
        });

        it('is not a control', () => {
            setup();
            expect(screen.queryByRole('button')).not.toBeInTheDocument();
            expect(screen.queryByRole('link')).not.toBeInTheDocument();
        });

        it('lets the consumer override the label', () => {
            setup({ 'aria-label': 'Your profile' });
            expect(
                screen.getByRole('img', { name: 'Your profile' }),
            ).toBeInTheDocument();
        });
    });

    describe('size', () => {
        it('is medium by default', () => {
            setup();
            expect(screen.getByRole('img')).toHaveClass(
                'tintora-avatar',
                'tintora-avatar--medium',
            );
        });

        it.each(Object.keys(sizes) as (keyof typeof sizes)[])(
            'applies the %s size',
            (size) => {
                setup({ size });
                expect(screen.getByRole('img')).toHaveClass(
                    `tintora-avatar--${size}`,
                );
            },
        );

        it('applies exactly one size', () => {
            setup({ size: 'large' });
            expect(
                screen
                    .getByRole('img')
                    .className.match(/tintora-avatar--(small|medium|large)/g),
            ).toHaveLength(1);
        });
    });

    describe('native props', () => {
        it('merges a consumer className without dropping the library ones', () => {
            setup({ className: 'custom' });
            expect(screen.getByRole('img')).toHaveClass(
                'tintora-avatar',
                'tintora-avatar--medium',
                'custom',
            );
        });

        it('forwards native props', () => {
            setup({
                id: 'me',
                title: 'Felipe',
                'data-testid': 'avatar',
            } as Partial<AvatarProps>);
            const avatar = screen.getByTestId('avatar');
            expect(avatar).toHaveAttribute('id', 'me');
            expect(avatar).toHaveAttribute('title', 'Felipe');
        });

        it('is a span', () => {
            setup();
            expect(screen.getByRole('img').tagName).toBe('SPAN');
        });
    });

    // jsdom does not load stylesheets, so check the source.
    describe('stylesheet', () => {
        it.each(Object.entries(sizes))(
            'defines .tintora-avatar--%s once, as a %ipx square',
            (name, px) => {
                const selector = `.tintora-avatar--${name}`;
                expect(
                    css.match(new RegExp(`\\${selector}\\s*\\{`, 'g')),
                ).toHaveLength(1);
                const body = rule(selector);
                expect(body).toMatch(new RegExp(`width:\\s*${px}px`));
                expect(body).toMatch(new RegExp(`height:\\s*${px}px`));
            },
        );

        it('is a circle', () => {
            expect(rule('.tintora-avatar')).toMatch(
                /border-radius:\s*var\(--tintora-radius-pill\)/,
            );
        });

        it('keeps its size inside a flex row', () => {
            expect(rule('.tintora-avatar')).toMatch(
                /flex-shrink:\s*0|flex:\s*none/,
            );
        });

        it('clips the image to the circle', () => {
            expect(rule('.tintora-avatar')).toMatch(/overflow:\s*hidden/);
        });

        it('fills the circle with the image, cropping instead of stretching', () => {
            const body = rule('.tintora-avatar > img');
            expect(body).toMatch(/width:\s*100%/);
            expect(body).toMatch(/height:\s*100%/);
            expect(body).toMatch(/object-fit:\s*cover/);
        });

        it('uses bold text', () => {
            for (const name of Object.keys(sizes)) {
                expect(rule(`.tintora-avatar--${name}`)).toMatch(
                    /font-weight:\s*var\(--tintora-font-weight-bold\)/,
                );
            }
        });

        it('has no hardcoded colours outside the avatar fill', () => {
            // The tan fill is the only literal; text uses a token.
            const withoutFill = css.replace(
                /linear-gradient\([^)]*\)[^;]*/,
                '',
            );
            expect(withoutFill).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(/i);
        });
    });

    describe('accessibility (axe)', () => {
        it.each(Object.keys(sizes) as (keyof typeof sizes)[])(
            'has no violations with initials: %s',
            async (size) => {
                const { container } = setup({ size });
                await expectNoA11yViolations(container);
            },
        );

        it.each(Object.keys(sizes) as (keyof typeof sizes)[])(
            'has no violations with a photo: %s',
            async (size) => {
                const { container } = setup({ size, src: photo });
                await expectNoA11yViolations(container);
            },
        );
    });

    it('requires a name', () => {
        // @ts-expect-error an avatar needs a name
        const props: AvatarProps = {};
        expect(props).toBeDefined();
    });

    it('rejects an unknown size', () => {
        // @ts-expect-error only small, medium and large exist
        const props: AvatarProps = { name: 'A B', size: 'huge' };
        expect(props).toBeDefined();
    });
});
