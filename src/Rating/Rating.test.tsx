import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Rating.css'), 'utf8');
import { expectNoA11yViolations } from '../test-utils';
import { Rating } from './Rating';
import { RatingInput } from './RatingInput';

const fill = (container: HTMLElement) =>
    container.querySelector<HTMLElement>('.tintora-rating__fill')!;

describe('Rating', () => {
    it('is an image named by its score', () => {
        render(<Rating value={4.8} />);
        expect(
            screen.getByRole('img', { name: 'Rated 4.8 out of 5' }),
        ).toBeInTheDocument();
    });

    it('takes a translated name', () => {
        render(<Rating value={4} aria-label="Note : 4 sur 5" />);
        expect(
            screen.getByRole('img', { name: 'Note : 4 sur 5' }),
        ).toBeInTheDocument();
    });

    it('fills the stars up to the score, as a percentage', () => {
        const { container } = render(<Rating value={4.5} />);
        expect(fill(container).style.width).toBe('90%');
    });

    it('draws five stars by default, in the track and the fill', () => {
        const { container } = render(<Rating value={3} />);
        expect(
            container.querySelectorAll('.tintora-rating__track svg'),
        ).toHaveLength(5);
        expect(fill(container).querySelectorAll('svg')).toHaveLength(5);
    });

    it('takes a different max', () => {
        const { container } = render(<Rating value={5} max={10} />);
        expect(
            container.querySelectorAll('.tintora-rating__track svg'),
        ).toHaveLength(10);
        expect(fill(container).style.width).toBe('50%');
        expect(
            screen.getByRole('img', { name: 'Rated 5 out of 10' }),
        ).toBeInTheDocument();
    });

    it('clamps a score outside 0..max', () => {
        const { container, rerender } = render(<Rating value={9} />);
        expect(fill(container).style.width).toBe('100%');
        rerender(<Rating value={-2} />);
        expect(fill(container).style.width).toBe('0%');
    });

    it('shows the count, or not', () => {
        const { rerender } = render(<Rating value={4} count={212} />);
        expect(screen.getByText('(212)')).toBeInTheDocument();
        rerender(<Rating value={4} />);
        expect(screen.queryByText(/\(/)).toBeNull();
    });

    it('keeps the consumer className and passes attributes through', () => {
        render(<Rating value={4} className="custom" data-testid="r" />);
        expect(screen.getByTestId('r')).toHaveClass('tintora-rating', 'custom');
    });

    it('has no accessibility violations', async () => {
        const { container } = render(<Rating value={4.5} count={12} />);
        await expectNoA11yViolations(container);
    });
});

describe('Rating stylesheet', () => {
    it('keeps the stars from shrinking, so the fill lines up with the track', () => {
        expect(css).toMatch(
            /\.tintora-rating__fill\s*>\s*svg\s*\{[^}]*flex-shrink:\s*0/,
        );
        expect(css).toMatch(
            /\.tintora-rating__track\s*>\s*svg[^{]*\{[^}]*flex-shrink:\s*0/,
        );
    });
});

describe('RatingInput', () => {
    const setup = (props = {}) =>
        render(<RatingInput aria-label="Your rating" {...props} />);

    it('is a radio group of five stars, named', () => {
        setup();
        expect(
            screen.getByRole('radiogroup', { name: 'Your rating' }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(5);
    });

    it('names each star by its number', () => {
        setup();
        expect(
            screen.getByRole('radio', { name: '1 star' }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('radio', { name: '4 stars' }),
        ).toBeInTheDocument();
    });

    it('takes translated star names', () => {
        setup({ starLabel: (n: number) => `${n} étoiles` });
        expect(
            screen.getByRole('radio', { name: '3 étoiles' }),
        ).toBeInTheDocument();
    });

    it('starts empty, or at defaultValue', () => {
        const { unmount } = setup();
        expect(screen.queryByRole('radio', { checked: true })).toBeNull();
        unmount();
        setup({ defaultValue: 3 });
        expect(screen.getByRole('radio', { name: '3 stars' })).toBeChecked();
    });

    it('selects a star on click and reports the number', async () => {
        const onValueChange = vi.fn();
        setup({ onValueChange });
        await userEvent.click(screen.getByRole('radio', { name: '4 stars' }));
        expect(screen.getByRole('radio', { name: '4 stars' })).toBeChecked();
        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(4);
    });

    it('fills the stars up to the selected one', async () => {
        const { container } = setup({ defaultValue: 2 });
        const filled = () =>
            container.querySelectorAll('.tintora-rating-input__star--filled')
                .length;
        expect(filled()).toBe(2);
        await userEvent.click(screen.getByRole('radio', { name: '5 stars' }));
        expect(filled()).toBe(5);
    });

    it('does not change by itself when controlled', async () => {
        const onValueChange = vi.fn();
        setup({ value: 2, onValueChange });
        await userEvent.click(screen.getByRole('radio', { name: '5 stars' }));
        expect(onValueChange).toHaveBeenCalledWith(5);
        expect(screen.getByRole('radio', { name: '2 stars' })).toBeChecked();
    });

    it('moves with the arrow keys', async () => {
        setup({ defaultValue: 2 });
        screen.getByRole('radio', { name: '2 stars' }).focus();
        await userEvent.keyboard('{ArrowRight}');
        expect(screen.getByRole('radio', { name: '3 stars' })).toBeChecked();
    });

    it('disables every star', () => {
        setup({ disabled: true });
        for (const radio of screen.getAllByRole('radio')) {
            expect(radio).toBeDisabled();
        }
    });

    it('does not select when disabled', async () => {
        const onValueChange = vi.fn();
        setup({ disabled: true, onValueChange });
        await userEvent.click(screen.getByRole('radio', { name: '3 stars' }));
        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('has no accessibility violations', async () => {
        const { container } = setup({ defaultValue: 3 });
        await expectNoA11yViolations(container);
    });
});
