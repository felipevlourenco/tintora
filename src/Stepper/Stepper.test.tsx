import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

    describe('accessibility', () => {
        it('has no violations', async () => {
            const { container } = setup();
            await expectNoA11yViolations(container);
        });

        it('has no violations when every step is complete', async () => {
            const { container } = setup({ current: 3 });
            await expectNoA11yViolations(container);
        });
    });
});
