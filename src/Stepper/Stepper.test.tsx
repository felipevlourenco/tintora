import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Stepper, type StepperProps } from './Stepper';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Stepper.css'), 'utf8');

const steps = [
    { label: 'Cart' },
    { label: 'Details and payment' },
    { label: 'Confirmation' },
];

const setup = (props: Partial<StepperProps> = {}) =>
    render(<Stepper steps={steps} current={1} {...props} />);

const items = () => screen.getAllByRole('listitem');

describe('Stepper', () => {
    describe('landmark', () => {
        it('is a navigation named Progress', () => {
            setup();
            expect(
                screen.getByRole('navigation', { name: 'Progress' }),
            ).toHaveClass('tintora-stepper');
        });

        it('takes a translated name', () => {
            setup({ 'aria-label': 'Progression' });
            expect(
                screen.getByRole('navigation', { name: 'Progression' }),
            ).toBeInTheDocument();
        });

        it('keeps the consumer className and passes attributes through', () => {
            setup({ className: 'custom', id: 'checkout' });
            const nav = screen.getByRole('navigation');
            expect(nav).toHaveClass('tintora-stepper', 'custom');
            expect(nav).toHaveAttribute('id', 'checkout');
        });

        it('renders nothing without steps', () => {
            const { container } = render(<Stepper steps={[]} current={0} />);
            expect(container).toBeEmptyDOMElement();
        });

        it('does not leak its props to the nav element', () => {
            setup({ completedLabel: 'Done' });
            const nav = screen.getByRole('navigation');
            expect(nav).not.toHaveAttribute('steps');
            expect(nav).not.toHaveAttribute('current');
            expect(nav).not.toHaveAttribute('completedlabel');
        });
    });

    describe('steps', () => {
        it('is an ordered list with one item per step, in order', () => {
            setup();
            expect(screen.getByRole('list').tagName).toBe('OL');
            expect(items()).toHaveLength(3);
            expect(items()[0]).toHaveTextContent('Cart');
            expect(items()[1]).toHaveTextContent('Details and payment');
            expect(items()[2]).toHaveTextContent('Confirmation');
        });

        it('marks the steps before the current one complete', () => {
            setup({ current: 2 });
            expect(items()[0]).toHaveClass('tintora-stepper__step--complete');
            expect(items()[1]).toHaveClass('tintora-stepper__step--complete');
        });

        it('marks the current step, and the ones after it upcoming', () => {
            setup({ current: 1 });
            expect(items()[1]).toHaveClass('tintora-stepper__step--current');
            expect(items()[2]).toHaveClass('tintora-stepper__step--upcoming');
        });

        it('sets aria-current="step" on the current step only', () => {
            setup({ current: 1 });
            expect(items()[1]).toHaveAttribute('aria-current', 'step');
            expect(items()[0]).not.toHaveAttribute('aria-current');
            expect(items()[2]).not.toHaveAttribute('aria-current');
        });

        it('shows the step number on the current and upcoming steps', () => {
            setup({ current: 1 });
            expect(within(items()[1]).getByText('2')).toBeInTheDocument();
            expect(within(items()[2]).getByText('3')).toBeInTheDocument();
        });

        it('hides the number from assistive tech', () => {
            setup({ current: 1 });
            expect(within(items()[2]).getByText('3')).toHaveAttribute(
                'aria-hidden',
                'true',
            );
        });

        it('shows a check, not a number, on a complete step', () => {
            setup({ current: 1 });
            expect(within(items()[0]).queryByText('1')).toBeNull();
            expect(
                items()[0].querySelector('.tintora-stepper__marker svg'),
            ).toBeInTheDocument();
        });

        it('says Completed to assistive tech on a complete step only', () => {
            setup({ current: 1 });
            expect(
                within(items()[0]).getByText('Completed'),
            ).toBeInTheDocument();
            expect(within(items()[1]).queryByText('Completed')).toBeNull();
            expect(within(items()[2]).queryByText('Completed')).toBeNull();
        });

        it('takes a translated completed label', () => {
            setup({ current: 1, completedLabel: 'Terminé' });
            expect(within(items()[0]).getByText('Terminé')).toBeInTheDocument();
        });

        it('renders a label that is a node', () => {
            render(
                <Stepper
                    steps={[{ label: <b>Cart</b> }, { label: 'Pay' }]}
                    current={0}
                />,
            );
            expect(screen.getByText('Cart').tagName).toBe('B');
        });
    });

    describe('current out of range', () => {
        it('completes every step and has no current one at steps.length', () => {
            setup({ current: 3 });
            for (const item of items()) {
                expect(item).toHaveClass('tintora-stepper__step--complete');
            }
            expect(document.querySelector('[aria-current]')).toBeNull();
        });

        it('clamps a number past the end to all complete', () => {
            setup({ current: 9 });
            for (const item of items()) {
                expect(item).toHaveClass('tintora-stepper__step--complete');
            }
        });

        it('clamps a negative number to the first step', () => {
            setup({ current: -2 });
            expect(items()[0]).toHaveClass('tintora-stepper__step--current');
            expect(items()[1]).toHaveClass('tintora-stepper__step--upcoming');
        });
    });

    describe('onStepClick', () => {
        it('has no buttons without it', () => {
            setup({ current: 2 });
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('turns the complete steps into buttons, and only those', () => {
            setup({ current: 2, onStepClick: () => {} });
            expect(screen.getAllByRole('button')).toHaveLength(2);
            expect(within(items()[0]).getByRole('button')).toBeInTheDocument();
            expect(within(items()[1]).getByRole('button')).toBeInTheDocument();
            expect(within(items()[2]).queryByRole('button')).toBeNull();
        });

        it('has no button on the first step when it is the current one', () => {
            setup({ current: 0, onStepClick: () => {} });
            expect(screen.queryByRole('button')).toBeNull();
        });

        it('makes every step a button once all are complete', () => {
            setup({ current: 3, onStepClick: () => {} });
            expect(screen.getAllByRole('button')).toHaveLength(3);
        });

        it('names the button by the label, after Completed', () => {
            setup({ current: 1, onStepClick: () => {} });
            expect(
                screen.getByRole('button', { name: 'Completed Cart' }),
            ).toBeInTheDocument();
        });

        it('calls onStepClick with the index of the clicked step', async () => {
            const onStepClick = vi.fn();
            setup({ current: 2, onStepClick });
            await userEvent.click(items()[1].querySelector('button')!);
            expect(onStepClick).toHaveBeenCalledOnce();
            expect(onStepClick).toHaveBeenCalledWith(1);
            await userEvent.click(items()[0].querySelector('button')!);
            expect(onStepClick).toHaveBeenLastCalledWith(0);
        });

        it('works from the keyboard', async () => {
            const onStepClick = vi.fn();
            setup({ current: 1, onStepClick });
            await userEvent.tab();
            expect(screen.getByRole('button')).toHaveFocus();
            await userEvent.keyboard('{Enter}');
            expect(onStepClick).toHaveBeenCalledWith(0);
        });

        it('is a plain button, so it does not submit a parent form', () => {
            setup({ current: 1, onStepClick: () => {} });
            expect(screen.getByRole('button')).toHaveAttribute(
                'type',
                'button',
            );
        });

        it('keeps aria-current on the current step, not on a button', () => {
            setup({ current: 1, onStepClick: () => {} });
            expect(items()[1]).toHaveAttribute('aria-current', 'step');
            expect(screen.getByRole('button')).not.toHaveAttribute(
                'aria-current',
            );
        });

        it('does not leak onStepClick to the nav element', () => {
            setup({ onStepClick: () => {} });
            expect(screen.getByRole('navigation')).not.toHaveAttribute(
                'onstepclick',
            );
        });
    });

    describe('stylesheet', () => {
        it('keeps only the current label on screen on small screens, like the Drawer breakpoint', () => {
            expect(css).toMatch(
                /@media\s*\(max-width:\s*480px\)\s*\{[^@]*\.tintora-stepper__step:not\(\.tintora-stepper__step--current\)\s+\.tintora-stepper__label\s*\{[^}]*clip/,
            );
        });

        it('hides those labels visually, not with display: none, so they keep their name', () => {
            const media = css.match(
                /@media\s*\(max-width:\s*480px\)\s*\{[^@]*/,
            )?.[0];
            expect(media).toBeDefined();
            expect(media).not.toMatch(/display:\s*none/);
        });
    });

    describe('stylesheet: clickable steps', () => {
        it('shows a pointer and a focus ring on the step button', () => {
            expect(css).toMatch(
                /\.tintora-stepper__button\s*\{[^}]*cursor:\s*pointer/,
            );
            expect(css).toMatch(
                /\.tintora-stepper__button:focus-visible\s*\{[^}]*outline/,
            );
        });
    });

    describe('accessibility', () => {
        it('has no violations', async () => {
            const { container } = setup();
            await expectNoA11yViolations(container);
        });

        it('has no violations with clickable steps', async () => {
            const { container } = setup({ current: 2, onStepClick: () => {} });
            await expectNoA11yViolations(container);
        });

        it('has no violations when every step is complete', async () => {
            const { container } = setup({ current: 3 });
            await expectNoA11yViolations(container);
        });
    });
});
