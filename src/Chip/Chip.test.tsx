import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Chip, type ChipProps } from './Chip';

const setup = (props: Partial<ChipProps> = {}) =>
    render(<Chip {...props}>Day 1</Chip>);

describe('Chip', () => {
    it('is a button named by its label', () => {
        setup();
        expect(
            screen.getByRole('button', { name: 'Day 1' }),
        ).toBeInTheDocument();
    });

    it('never submits a form by accident', () => {
        setup();
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('merges a consumer className', () => {
        setup({ className: 'custom' });
        expect(screen.getByRole('button')).toHaveClass(
            'tintora-chip',
            'custom',
        );
    });

    describe('toggle state', () => {
        it('is a plain button when selected is omitted', () => {
            setup();
            expect(screen.getByRole('button')).not.toHaveAttribute(
                'aria-pressed',
            );
        });

        it('is pressed when selected', () => {
            setup({ selected: true });
            expect(screen.getByRole('button')).toHaveAttribute(
                'aria-pressed',
                'true',
            );
        });

        it('is a toggle that is not pressed when selected is false', () => {
            setup({ selected: false });
            expect(screen.getByRole('button')).toHaveAttribute(
                'aria-pressed',
                'false',
            );
        });

        it('never uses aria-selected, which is invalid on a button', () => {
            setup({ selected: true });
            expect(screen.getByRole('button')).not.toHaveAttribute(
                'aria-selected',
            );
        });

        it('keeps a consumer aria-pressed when selected is omitted', () => {
            setup({ 'aria-pressed': 'mixed' });
            expect(screen.getByRole('button')).toHaveAttribute(
                'aria-pressed',
                'mixed',
            );
        });

        it('flips as the parent updates selected', async () => {
            const Toggle = () => {
                const [on, setOn] = useState(false);
                return (
                    <Chip selected={on} onClick={() => setOn(!on)}>
                        Day 1
                    </Chip>
                );
            };
            render(<Toggle />);
            const chip = screen.getByRole('button', { name: 'Day 1' });
            expect(chip).toHaveAttribute('aria-pressed', 'false');
            await userEvent.click(chip);
            expect(chip).toHaveAttribute('aria-pressed', 'true');
            await userEvent.click(chip);
            expect(chip).toHaveAttribute('aria-pressed', 'false');
        });
    });

    describe('interaction', () => {
        it('calls onClick when clicked', async () => {
            const onClick = vi.fn();
            setup({ onClick });
            await userEvent.click(screen.getByRole('button'));
            expect(onClick).toHaveBeenCalledOnce();
        });

        it('can be activated with Enter and Space', async () => {
            const onClick = vi.fn();
            setup({ onClick });
            await userEvent.tab();
            expect(screen.getByRole('button')).toHaveFocus();
            await userEvent.keyboard('{Enter}');
            await userEvent.keyboard(' ');
            expect(onClick).toHaveBeenCalledTimes(2);
        });

        it('ignores clicks when disabled', async () => {
            const onClick = vi.fn();
            setup({ onClick, disabled: true });
            const chip = screen.getByRole('button');
            expect(chip).toBeDisabled();
            await userEvent.click(chip);
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    describe('accessibility (axe)', () => {
        it.each([
            { name: 'default', props: {} },
            { name: 'selected', props: { selected: true } },
            { name: 'toggle, not selected', props: { selected: false } },
            { name: 'disabled', props: { disabled: true } },
        ])('has no violations: $name', async ({ props }) => {
            const { container } = setup(props);
            await expectNoA11yViolations(container);
        });
    });

    it('requires children', () => {
        // @ts-expect-error a chip needs a label
        const props: ChipProps = {};
        expect(props).toBeDefined();
    });
});
