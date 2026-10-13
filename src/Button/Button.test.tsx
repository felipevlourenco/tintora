import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<React.ComponentProps<typeof Button>> = {}) =>
    render(
        <Button variant="primary" size="medium" {...props}>
            Save
        </Button>,
    );

describe('Button', () => {
    it('renders its label as an accessible button', () => {
        setup();
        expect(
            screen.getByRole('button', { name: 'Save' }),
        ).toBeInTheDocument();
    });

    it('defaults to type="button" so it never submits a form by accident', () => {
        setup();
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('lets the type be overridden', () => {
        setup({ type: 'submit' });
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('applies base, variant and size classes', () => {
        setup({ variant: 'outline', size: 'large' });
        expect(screen.getByRole('button')).toHaveClass(
            'tintora-button',
            'tintora-button--outline',
            'tintora-button--large',
        );
    });

    it('merges a consumer className without dropping the library ones', () => {
        setup({ className: 'custom' });
        expect(screen.getByRole('button')).toHaveClass(
            'tintora-button',
            'tintora-button--primary',
            'custom',
        );
    });

    it('forwards native props', () => {
        setup({ 'aria-label': 'Save changes', id: 'save' });
        const button = screen.getByRole('button', { name: 'Save changes' });
        expect(button).toHaveAttribute('id', 'save');
    });

    describe('icons', () => {
        it('renders the leading icon before the label, hidden from assistive tech', () => {
            setup({ leadingIcon: <svg data-testid="lead" /> });
            const button = screen.getByRole('button');
            const icon = screen.getByTestId('lead');
            expect(button).toHaveClass('tintora-button--leading-icon');
            expect(button).not.toHaveClass('tintora-button--trailing-icon');
            expect(icon.parentElement).toHaveClass('tintora-button__icon');
            expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
            expect(button.firstElementChild).toContainElement(icon);
        });

        it('renders the trailing icon after the label', () => {
            setup({ trailingIcon: <svg data-testid="trail" /> });
            const button = screen.getByRole('button');
            expect(button).toHaveClass('tintora-button--trailing-icon');
            expect(button.lastElementChild).toContainElement(
                screen.getByTestId('trail'),
            );
        });

        it('does not leak icon props onto the DOM element', () => {
            setup({ leadingIcon: <svg />, trailingIcon: <svg /> });
            const button = screen.getByRole('button');
            expect(button).not.toHaveAttribute('leadingicon');
            expect(button).not.toHaveAttribute('trailingicon');
        });
    });

    describe('interaction', () => {
        it('calls onClick when clicked', async () => {
            const onClick = vi.fn();
            setup({ onClick });
            await userEvent.click(screen.getByRole('button'));
            expect(onClick).toHaveBeenCalledOnce();
        });

        it('does not call onClick when disabled', async () => {
            const onClick = vi.fn();
            setup({ onClick, disabled: true });
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
            await userEvent.click(button);
            expect(onClick).not.toHaveBeenCalled();
        });

        it('can be activated with the keyboard', async () => {
            const onClick = vi.fn();
            setup({ onClick });
            await userEvent.tab();
            expect(screen.getByRole('button')).toHaveFocus();
            await userEvent.keyboard('{Enter}');
            expect(onClick).toHaveBeenCalledOnce();
        });
    });

    describe('accessibility (axe)', () => {
        const variants = ['primary', 'secondary', 'outline', 'ghost'] as const;
        const sizes = ['small', 'medium', 'large'] as const;

        it.each(variants)('has no violations: %s', async (variant) => {
            const { container } = setup({ variant });
            await expectNoA11yViolations(container);
        });

        it.each(sizes)('has no violations: %s', async (size) => {
            const { container } = setup({ size });
            await expectNoA11yViolations(container);
        });

        it('has no violations when disabled', async () => {
            const { container } = setup({ disabled: true });
            await expectNoA11yViolations(container);
        });

        it('has no violations with icons', async () => {
            const { container } = setup({
                leadingIcon: <svg />,
                trailingIcon: <svg />,
            });
            await expectNoA11yViolations(container);
        });

        it('has no violations when only named by aria-label', async () => {
            const { container } = render(
                <Button
                    variant="ghost"
                    aria-label="Close"
                    leadingIcon={<svg />}
                />,
            );
            await expectNoA11yViolations(container);
        });
    });
});
