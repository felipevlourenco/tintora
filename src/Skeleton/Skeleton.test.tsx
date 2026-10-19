import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './Skeleton';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: React.ComponentProps<typeof Skeleton> = {}) =>
    render(<Skeleton data-testid="skeleton" {...props} />);

const get = (container: HTMLElement) =>
    container.firstElementChild as HTMLElement;

describe('Skeleton', () => {
    it('is decorative, hidden from assistive tech', () => {
        const { container } = setup();
        expect(get(container)).toHaveAttribute('aria-hidden', 'true');
    });

    it('sizes itself from width and height, in pixels or any CSS length', () => {
        const { container } = setup({ width: 48, height: '50%' });
        expect(get(container)).toHaveStyle({ width: '48px', height: '50%' });
    });

    it('leaves the CSS defaults alone when no size is given', () => {
        const { container } = setup();
        expect(get(container).style.width).toBe('');
        expect(get(container).style.height).toBe('');
    });

    it('merges className and style, and forwards native props', () => {
        const { container } = setup({
            className: 'custom',
            style: { opacity: 0.5 },
            width: 10,
        });
        expect(get(container)).toHaveClass('tintora-skeleton', 'custom');
        expect(get(container)).toHaveStyle({ opacity: '0.5', width: '10px' });
        expect(get(container)).toHaveAttribute('data-testid', 'skeleton');
    });

    it('has no accessibility violations', async () => {
        const { container } = setup();
        await expectNoA11yViolations(container);
    });
});
