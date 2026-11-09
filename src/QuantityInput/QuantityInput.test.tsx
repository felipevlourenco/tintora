import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { QuantityInput, type QuantityInputProps } from './QuantityInput';

const setup = (props: QuantityInputProps = {}) =>
    render(<QuantityInput {...props} />);
const field = () => screen.getByRole('textbox', { name: 'Quantity' });
const minus = () => screen.getByRole('button', { name: 'Decrease quantity' });
const plus = () => screen.getByRole('button', { name: 'Increase quantity' });

describe('QuantityInput', () => {
    describe('structure', () => {
        it('is a group with a number field and two buttons', () => {
            setup();
            expect(screen.getByRole('group')).toHaveClass('tintora-quantity');
            expect(field()).toBeInTheDocument();
            expect(minus()).toHaveAttribute('type', 'button');
            expect(plus()).toBeInTheDocument();
        });

        it('takes translated names', () => {
            setup({
                'aria-label': 'Quantité',
                decreaseLabel: 'Moins',
                increaseLabel: 'Plus',
            });
            expect(
                screen.getByRole('textbox', { name: 'Quantité' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Moins' }),
            ).toBeInTheDocument();
            expect(
                screen.getByRole('button', { name: 'Plus' }),
            ).toBeInTheDocument();
        });

        it('asks for digits on a phone keyboard', () => {
            setup();
            expect(field()).toHaveAttribute('inputmode', 'numeric');
        });

        it('keeps the consumer className and passes attributes through', () => {
            setup({ className: 'custom', id: 'qty' } as QuantityInputProps);
            expect(screen.getByRole('group')).toHaveClass(
                'tintora-quantity',
                'custom',
            );
            expect(screen.getByRole('group')).toHaveAttribute('id', 'qty');
        });
    });

    describe('value', () => {
        it('starts at min, or at defaultValue', () => {
            const { unmount } = setup();
            expect(field()).toHaveValue('0');
            unmount();
            setup({ defaultValue: 3 });
            expect(field()).toHaveValue('3');
        });

        it('starts at min when min is above 0', () => {
            setup({ min: 1 });
            expect(field()).toHaveValue('1');
        });

        it('adds and removes with the buttons', async () => {
            setup({ defaultValue: 2 });
            await userEvent.click(plus());
            expect(field()).toHaveValue('3');
            await userEvent.click(minus());
            await userEvent.click(minus());
            expect(field()).toHaveValue('1');
        });

        it('moves by step', async () => {
            setup({ defaultValue: 10, step: 5 });
            await userEvent.click(plus());
            expect(field()).toHaveValue('15');
        });

        it('disables minus at min and plus at max', () => {
            setup({ defaultValue: 1, min: 1, max: 1 });
            expect(minus()).toBeDisabled();
            expect(plus()).toBeDisabled();
        });

        it('has no upper limit without max', async () => {
            setup({ defaultValue: 998 });
            await userEvent.click(plus());
            await userEvent.click(plus());
            expect(field()).toHaveValue('1000');
            expect(plus()).toBeEnabled();
        });

        it('reports each change with a number', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 2, onValueChange });
            await userEvent.click(plus());
            expect(onValueChange).toHaveBeenLastCalledWith(3);
            await userEvent.click(minus());
            expect(onValueChange).toHaveBeenLastCalledWith(2);
        });

        it('does not change by itself when controlled', async () => {
            const onValueChange = vi.fn();
            setup({ value: 2, onValueChange });
            await userEvent.click(plus());
            expect(onValueChange).toHaveBeenCalledWith(3);
            expect(field()).toHaveValue('2');
        });

        it('follows the parent when controlled', async () => {
            function Parent() {
                const [value, setValue] = useState(1);
                return <QuantityInput value={value} onValueChange={setValue} />;
            }
            render(<Parent />);
            await userEvent.click(plus());
            expect(field()).toHaveValue('2');
        });
    });

    describe('typing', () => {
        it('commits the typed number when the field loses focus', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 1, onValueChange });
            await userEvent.clear(field());
            await userEvent.type(field(), '12');
            expect(onValueChange).not.toHaveBeenCalled();
            await userEvent.tab();
            expect(onValueChange).toHaveBeenCalledExactlyOnceWith(12);
            expect(field()).toHaveValue('12');
        });

        it('commits on Enter', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 1, onValueChange });
            await userEvent.clear(field());
            await userEvent.type(field(), '7{Enter}');
            expect(onValueChange).toHaveBeenCalledWith(7);
        });

        it('keeps digits only', async () => {
            setup({ defaultValue: 1 });
            await userEvent.clear(field());
            await userEvent.type(field(), 'a1-2b');
            expect(field()).toHaveValue('12');
        });

        it('clamps to max and to min', async () => {
            setup({ defaultValue: 2, min: 1, max: 10 });
            await userEvent.clear(field());
            await userEvent.type(field(), '99');
            await userEvent.tab();
            expect(field()).toHaveValue('10');
            await userEvent.clear(field());
            await userEvent.type(field(), '0');
            await userEvent.tab();
            expect(field()).toHaveValue('1');
        });

        it('goes back to min when left empty', async () => {
            setup({ defaultValue: 4, min: 1 });
            await userEvent.clear(field());
            await userEvent.tab();
            expect(field()).toHaveValue('1');
        });

        it('does not report a number that did not change', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 3, onValueChange });
            await userEvent.click(field());
            await userEvent.tab();
            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe('disabled', () => {
        it('disables the field and both buttons', () => {
            setup({ disabled: true, defaultValue: 2 });
            expect(field()).toBeDisabled();
            expect(minus()).toBeDisabled();
            expect(plus()).toBeDisabled();
        });
    });

    describe('accessibility', () => {
        it('has no violations', async () => {
            const { container } = setup({ defaultValue: 2 });
            await expectNoA11yViolations(container);
        });
    });
});
