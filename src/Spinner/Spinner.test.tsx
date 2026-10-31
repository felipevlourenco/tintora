import { render, screen } from '@testing-library/react';
import { Spinner, SPINNER_SIZE_MAP } from './Spinner';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<React.ComponentProps<typeof Spinner>> = {}) =>
    render(<Spinner {...props} />);

describe('Spinner', () => {
    it('is exposed as an image labelled "Loading"', () => {
        setup();
        expect(
            screen.getByRole('img', { name: 'Loading' }),
        ).toBeInTheDocument();
    });

    it('takes a translated label', () => {
        setup({ 'aria-label': 'Carregando' });
        expect(
            screen.getByRole('img', { name: 'Carregando' }),
        ).toBeInTheDocument();
        expect(screen.queryByRole('img', { name: 'Loading' })).toBeNull();
    });

    it('defaults to the medium size', () => {
        setup();
        expect(screen.getByRole('img')).toHaveAttribute(
            'width',
            String(SPINNER_SIZE_MAP.medium.width),
        );
    });

    it.each(['small', 'medium', 'large'] as const)(
        'sizes itself for %s',
        (size) => {
            setup({ size });
            const { width, height, strokeWidth } = SPINNER_SIZE_MAP[size];
            const svg = screen.getByRole('img');
            expect(svg).toHaveAttribute('width', String(width));
            expect(svg).toHaveAttribute('height', String(height));
            expect(svg.querySelector('path')).toHaveAttribute(
                'stroke-width',
                String(strokeWidth),
            );
        },
    );

    it('uses the accent fill by default and the text colour for "current"', () => {
        const { unmount } = setup();
        expect(screen.getByRole('img').querySelector('path')).toHaveAttribute(
            'stroke',
            'var(--tintora-control-fill)',
        );
        unmount();
        setup({ color: 'current' });
        expect(screen.getByRole('img').querySelector('path')).toHaveAttribute(
            'stroke',
            'currentColor',
        );
    });

    it('has no accessibility violations', async () => {
        const { container } = setup();
        await expectNoA11yViolations(container);
    });
});
