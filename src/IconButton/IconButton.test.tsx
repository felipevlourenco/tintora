import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton, type IconButtonProps } from './IconButton';

const setup = (props: Partial<IconButtonProps> = {}) =>
    render(
        <IconButton
            aria-label="Notifications"
            icon={<svg data-testid="icon" />}
            {...props}
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
});
