import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Dot, type DotProps } from './Dot';

const setup = (props: DotProps = {}) => render(<Dot {...props} />);
const dot = (container: HTMLElement) =>
    container.firstElementChild as HTMLElement;

describe('Dot', () => {
    it('is the unread dot by default', () => {
        const { container } = setup();
        expect(dot(container)).toHaveClass(
            'tintora-dot',
            'tintora-dot--unread',
        );
    });

    it.each(['unread', 'read', 'tick'] as const)(
        'applies the %s variant',
        (variant) => {
            const { container } = setup({ variant });
            expect(dot(container)).toHaveClass(`tintora-dot--${variant}`);
        },
    );

    it('is hidden from assistive tech when it has no label', () => {
        const { container } = setup();
        expect(dot(container)).toHaveAttribute('aria-hidden', 'true');
        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('is announced as an image with its label', () => {
        const { container } = setup({ label: 'Unread' });
        expect(screen.getByRole('img', { name: 'Unread' })).toBe(
            dot(container),
        );
        expect(dot(container)).not.toHaveAttribute('aria-hidden');
    });

    it('merges className and forwards native props', () => {
        const { container } = setup({
            className: 'custom',
            style: { position: 'absolute' },
            'data-testid': 'dot',
        } as DotProps);
        expect(dot(container)).toHaveClass('tintora-dot', 'custom');
        expect(dot(container)).toHaveStyle({ position: 'absolute' });
        expect(screen.getByTestId('dot')).toBe(dot(container));
    });

    describe('accessibility (axe)', () => {
        it.each([
            { name: 'decorative', props: {} },
            { name: 'unread with label', props: { label: 'Unread' } },
            {
                name: 'read with label',
                props: { variant: 'read', label: 'Read' },
            },
            {
                name: 'tick with label',
                props: { variant: 'tick', label: 'New section' },
            },
        ] as const)('has no violations: $name', async ({ props }) => {
            const { container } = setup({ ...props });
            await expectNoA11yViolations(container);
        });
    });

    it('does not take children', () => {
        // @ts-expect-error a dot has no content, use label instead
        const props: DotProps = { children: 'x' };
        expect(props).toBeDefined();
    });
});
