import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton, type IconButtonProps } from './IconButton';
import { expectNoA11yViolations } from '../test-utils';

// The props are a union, so tests pass them loosely and let the component sort them out.
type LooseProps = Partial<Record<keyof IconButtonProps, unknown>> &
    Record<string, unknown>;

const setup = (props: LooseProps = {}) =>
    render(
        <IconButton
            {...({
                'aria-label': 'Notifications',
                icon: <svg data-testid="icon" />,
                ...props,
            } as IconButtonProps)}
        />,
    );

describe('IconButton', () => {
    it('is a button named by its aria-label', () => {
        setup();
        expect(
            screen.getByRole('button', { name: 'Notifications' }),
        ).toBeInTheDocument();
    });

    it('hides the icon from assistive tech', () => {
        setup();
        expect(screen.getByTestId('icon').parentElement).toHaveAttribute(
            'aria-hidden',
            'true',
        );
    });

    it('is a round, large button by default and never submits a form', () => {
        setup();
        const button = screen.getByRole('button');
        expect(button).toHaveClass(
            'tintora-icon-button',
            'tintora-icon-button--round',
            'tintora-icon-button--large',
        );
        expect(button).toHaveAttribute('type', 'button');
    });

    it('builds on the secondary Button so it shares its states', () => {
        setup({ size: 'small' });
        expect(screen.getByRole('button')).toHaveClass(
            'tintora-button',
            'tintora-button--secondary',
            'tintora-button--small',
            'tintora-icon-button--small',
        );
    });

    it('merges a consumer className', () => {
        setup({ className: 'custom' });
        expect(screen.getByRole('button')).toHaveClass(
            'tintora-icon-button',
            'custom',
        );
    });

    it('does not leak the icon prop onto the DOM element', () => {
        setup();
        expect(screen.getByRole('button')).not.toHaveAttribute('icon');
    });

    it('calls onClick, but not when disabled', async () => {
        const onClick = vi.fn();
        const { rerender } = setup({ onClick });
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledOnce();

        rerender(
            <IconButton
                aria-label="Notifications"
                icon={<svg />}
                onClick={onClick}
                disabled
            />,
        );
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalledOnce();
    });

    describe('field', () => {
        it('has no size class and builds on the secondary Button', () => {
            setup({ variant: 'field' });
            const button = screen.getByRole('button');
            expect(button).toHaveClass(
                'tintora-icon-button--field',
                'tintora-button--secondary',
            );
            expect(button.className).not.toMatch(
                /tintora-icon-button--(small|medium|large)/,
            );
        });
    });

    describe('nav', () => {
        it('has no size class and builds on the ghost Button', () => {
            setup({ variant: 'nav' });
            const button = screen.getByRole('button');
            expect(button).toHaveClass(
                'tintora-icon-button--nav',
                'tintora-button--ghost',
            );
            expect(button.className).not.toMatch(
                /tintora-icon-button--(small|medium|large)/,
            );
        });

        it('is not the current page unless selected', () => {
            setup({ variant: 'nav' });
            expect(screen.getByRole('button')).not.toHaveAttribute(
                'aria-current',
            );
        });

        it('marks the current page when selected', () => {
            setup({ variant: 'nav', selected: true });
            expect(screen.getByRole('button')).toHaveAttribute(
                'aria-current',
                'page',
            );
        });

        it('does not leak the selected prop onto the DOM element', () => {
            setup({ variant: 'nav', selected: true });
            expect(screen.getByRole('button')).not.toHaveAttribute('selected');
        });
    });

    describe('accessibility (axe)', () => {
        it.each([
            { variant: 'round', size: 'small' },
            { variant: 'round', size: 'medium' },
            { variant: 'round', size: 'large' },
            { variant: 'field' },
            { variant: 'nav' },
            { variant: 'nav', selected: true },
            { variant: 'round', disabled: true },
        ])('has no violations: %j', async (props) => {
            const { container } = setup(props);
            await expectNoA11yViolations(container);
        });
    });

    // Compile-time checks: `pnpm typecheck` fails if a directive becomes unused.
    it('only accepts size on round, selected on nav, and needs a label', () => {
        const b = { 'aria-label': 'x', icon: null };
        // @ts-expect-error field has one fixed size
        const a1: IconButtonProps = { ...b, variant: 'field', size: 'small' };
        // @ts-expect-error nav has one fixed size
        const a2: IconButtonProps = { ...b, variant: 'nav', size: 'small' };
        // @ts-expect-error selected is only for nav
        const a3: IconButtonProps = { ...b, variant: 'round', selected: true };
        // @ts-expect-error an accessible name is required
        const a4: IconButtonProps = { icon: null };
        expect([a1, a2, a3, a4]).toHaveLength(4);
    });
});
