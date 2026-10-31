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

    describe('loading', () => {
        it('shows a spinner instead of the leading icon, hidden from assistive tech', () => {
            setup({ loading: true, leadingIcon: <svg data-testid="lead" /> });
            const button = screen.getByRole('button');
            expect(screen.queryByTestId('lead')).not.toBeInTheDocument();
            expect(
                button.querySelector('.tintora-spinner'),
            ).toBeInTheDocument();
            expect(button.firstElementChild).toHaveAttribute(
                'aria-hidden',
                'true',
            );
            expect(button).toHaveClass(
                'tintora-button--loading',
                'tintora-button--leading-icon',
            );
        });

        it('is disabled and aria-busy so it cannot be activated twice', async () => {
            const onClick = vi.fn();
            setup({ loading: true, onClick });
            const button = screen.getByRole('button', { name: 'Save' });
            expect(button).toBeDisabled();
            expect(button).toHaveAttribute('aria-busy', 'true');
            await userEvent.click(button);
            expect(onClick).not.toHaveBeenCalled();
        });

        it('is not busy by default', () => {
            setup();
            expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy');
            expect(screen.getByRole('button')).toBeEnabled();
        });

        it('stays disabled when disabled is set and loading ends', () => {
            setup({ loading: false, disabled: true });
            expect(screen.getByRole('button')).toBeDisabled();
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

        it('has no violations when loading', async () => {
            const { container } = setup({ loading: true });
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

    describe('as', () => {
        // Stands in for a router link: its own `to` prop, and it renders the
        // `className` and other props it is given.
        function RouterLink({
            to,
            children,
            ...props
        }: { to: string } & React.ComponentProps<'a'>) {
            return (
                <a href={to} data-router="" {...props}>
                    {children}
                </a>
            );
        }

        it('renders a real link with the button classes, and no button attributes', () => {
            render(
                <Button as="a" href="/requests" variant="primary" size="large">
                    Requests
                </Button>,
            );
            const link = screen.getByRole('link', { name: 'Requests' });
            expect(link).toHaveAttribute('href', '/requests');
            expect(link).toHaveClass(
                'tintora-button',
                'tintora-button--primary',
                'tintora-button--large',
            );
            expect(link).not.toHaveAttribute('type');
            expect(link).not.toHaveAttribute('disabled');
        });

        it('renders the given component with its own props', () => {
            render(
                <Button as={RouterLink} to="/requests" variant="primary">
                    Requests
                </Button>,
            );
            const link = screen.getByRole('link', { name: 'Requests' });
            expect(link).toHaveAttribute('data-router');
            expect(link).toHaveAttribute('href', '/requests');
            expect(link).toHaveClass('tintora-button');
        });

        it('type-checks the props of the given component', () => {
            render(
                // @ts-expect-error `to` is required by RouterLink
                <Button as={RouterLink} variant="primary">
                    Missing destination
                </Button>,
            );
        });

        it('marks a disabled link with aria-disabled and takes it out of the tab order', () => {
            render(
                <Button as="a" href="/requests" variant="primary" disabled>
                    Requests
                </Button>,
            );
            const link = screen.getByRole('link', { name: 'Requests' });
            expect(link).toHaveAttribute('aria-disabled', 'true');
            expect(link).toHaveAttribute('tabindex', '-1');
            expect(link).not.toHaveAttribute('disabled');
        });

        it('treats a loading link as busy and disabled', () => {
            render(
                <Button as="a" href="/requests" variant="primary" loading>
                    Requests
                </Button>,
            );
            const link = screen.getByRole('link', { name: 'Requests' });
            expect(link).toHaveAttribute('aria-busy', 'true');
            expect(link).toHaveAttribute('aria-disabled', 'true');
        });

        it('leaves an enabled link focusable and not aria-disabled', () => {
            render(
                <Button as="a" href="/requests" variant="primary">
                    Requests
                </Button>,
            );
            const link = screen.getByRole('link');
            expect(link).not.toHaveAttribute('aria-disabled');
            expect(link).not.toHaveAttribute('tabindex');
        });

        it('has no accessibility violations as a link', async () => {
            const { container } = render(
                <Button as="a" href="/requests" variant="primary" disabled>
                    Requests
                </Button>,
            );
            await expectNoA11yViolations(container);
        });
    });
});
