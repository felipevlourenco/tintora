import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button/Button';
import { expectNoA11yViolations } from '../test-utils';
import { EmptyState, type EmptyStateProps } from './EmptyState';

const setup = (props: Partial<EmptyStateProps> = {}) =>
    render(
        <EmptyState
            data-testid="empty"
            title="Your cart is empty"
            {...props}
        />,
    );

describe('EmptyState', () => {
    it('renders the title in a level 2 heading by default', () => {
        setup();
        expect(
            screen.getByRole('heading', {
                level: 2,
                name: 'Your cart is empty',
            }),
        ).toBeInTheDocument();
    });

    it('lets the heading level fit the page', () => {
        setup({ headingLevel: 3 });
        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('renders the description, the icon and the action when given', () => {
        setup({
            description: 'Add something to get started.',
            icon: <svg data-testid="icon" />,
            action: <Button variant="primary">Browse the shop</Button>,
        });
        expect(
            screen.getByText('Add something to get started.'),
        ).toBeInTheDocument();
        expect(screen.getByTestId('icon')).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Browse the shop' }),
        ).toBeInTheDocument();
    });

    it('hides the icon from assistive tech', () => {
        setup({ icon: <svg data-testid="icon" /> });
        expect(
            screen.getByTestId('icon').closest('.tintora-empty-state__icon'),
        ).toHaveAttribute('aria-hidden', 'true');
    });

    it.each(['icon', 'description', 'action'])(
        'has no %s wrapper when the slot is empty',
        (slot) => {
            const { container } = setup();
            expect(
                container.querySelector(`.tintora-empty-state__${slot}`),
            ).toBeNull();
        },
    );

    it('keeps the consumer className and passes attributes through', () => {
        setup({ className: 'custom', id: 'cart-empty' });
        const el = screen.getByTestId('empty');
        expect(el).toHaveClass('tintora-empty-state', 'custom');
        expect(el).toHaveAttribute('id', 'cart-empty');
    });

    it('does not leak its props to the DOM', () => {
        setup({ headingLevel: 3, description: 'x' });
        const el = screen.getByTestId('empty');
        expect(el).not.toHaveAttribute('headinglevel');
        expect(el).not.toHaveAttribute('description');
    });

    it('has no accessibility violations', async () => {
        const { container } = setup({
            description: 'Add something.',
            action: <Button variant="primary">Browse</Button>,
        });
        await expectNoA11yViolations(container);
    });
});
