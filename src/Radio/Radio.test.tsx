import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from './Radio';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<RadioGroupProps> = {}) =>
    render(
        <RadioGroup
            {...({ 'aria-label': 'Units', ...props } as RadioGroupProps)}
        >
            <Radio value="metric" aria-label="Metric" />
            <Radio value="imperial" aria-label="Imperial" />
            <Radio value="nautical" aria-label="Nautical" />
        </RadioGroup>,
    );

const radio = (name: string) => screen.getByRole('radio', { name });

describe('Radio', () => {
    it('is a radiogroup of radios, each named by its aria-label', () => {
        setup();
        expect(
            screen.getByRole('radiogroup', { name: 'Units' }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('radio')).toHaveLength(3);
        expect(radio('Metric')).toBeInTheDocument();
    });

    it('has nothing selected by default and honours defaultValue', () => {
        const { unmount } = setup();
        screen
            .getAllByRole('radio')
            .forEach((r) => expect(r).not.toBeChecked());
        unmount();
        setup({ defaultValue: 'imperial' });
        expect(radio('Imperial')).toBeChecked();
        expect(radio('Metric')).not.toBeChecked();
    });

    it('shares one name across the group, generated or given', () => {
        const { unmount } = setup();
        const names = new Set(
            screen.getAllByRole('radio').map((r) => r.getAttribute('name')),
        );
        expect(names.size).toBe(1);
        expect([...names][0]).toBeTruthy();
        unmount();
        setup({ name: 'units' });
        expect(radio('Metric')).toHaveAttribute('name', 'units');
    });

    it('forwards native props to the input and className to the wrapper', () => {
        const { container } = render(
            <RadioGroup aria-label="Units" className="group">
                <Radio value="a" aria-label="A" id="a" className="custom" />
            </RadioGroup>,
        );
        expect(radio('A')).toHaveAttribute('id', 'a');
        expect(container.firstElementChild).toHaveClass(
            'tintora-radio-group',
            'group',
        );
        expect(radio('A').parentElement).toHaveClass('tintora-radio', 'custom');
    });

    it('throws a clear error outside a RadioGroup', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<Radio value="a" aria-label="A" />)).toThrow(
            'Radio must be rendered inside a RadioGroup',
        );
        vi.restoreAllMocks();
    });

    describe('uncontrolled', () => {
        it('selects one at a time and reports the value', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange });
            await userEvent.click(radio('Metric'));
            expect(radio('Metric')).toBeChecked();
            await userEvent.click(radio('Nautical'));
            expect(radio('Nautical')).toBeChecked();
            expect(radio('Metric')).not.toBeChecked();
            expect(onValueChange).toHaveBeenNthCalledWith(1, 'metric');
            expect(onValueChange).toHaveBeenNthCalledWith(2, 'nautical');
        });

        it('does not report re-selecting the selected radio', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 'metric', onValueChange });
            await userEvent.click(radio('Metric'));
            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe('controlled', () => {
        it('only changes when the parent updates value', async () => {
            const onValueChange = vi.fn();
            setup({ value: 'metric', onValueChange });
            await userEvent.click(radio('Imperial'));
            expect(onValueChange).toHaveBeenCalledWith('imperial');
            expect(radio('Metric')).toBeChecked();
            expect(radio('Imperial')).not.toBeChecked();
        });

        it('shows nothing selected for null and follows the parent', async () => {
            const Parent = () => {
                const [value, setValue] = useState<string | null>(null);
                return (
                    <RadioGroup
                        aria-label="Units"
                        value={value}
                        onValueChange={setValue}
                    >
                        <Radio value="metric" aria-label="Metric" />
                        <Radio value="imperial" aria-label="Imperial" />
                    </RadioGroup>
                );
            };
            render(<Parent />);
            expect(radio('Metric')).not.toBeChecked();
            await userEvent.click(radio('Imperial'));
            expect(radio('Imperial')).toBeChecked();
        });
    });

    describe('keyboard', () => {
        it('moves selection with the arrow keys, as one tab stop', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 'metric', onValueChange });
            await userEvent.tab();
            expect(radio('Metric')).toHaveFocus();
            await userEvent.keyboard('{ArrowDown}');
            expect(radio('Imperial')).toHaveFocus();
            expect(radio('Imperial')).toBeChecked();
            expect(onValueChange).toHaveBeenCalledWith('imperial');
        });
    });

    describe('disabled', () => {
        it('disables the whole group', async () => {
            const onValueChange = vi.fn();
            setup({ disabled: true, onValueChange });
            screen
                .getAllByRole('radio')
                .forEach((r) => expect(r).toBeDisabled());
            await userEvent.click(radio('Metric'));
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('disables a single radio', async () => {
            render(
                <RadioGroup aria-label="Units">
                    <Radio value="a" aria-label="A" disabled />
                    <Radio value="b" aria-label="B" />
                </RadioGroup>,
            );
            expect(radio('A')).toBeDisabled();
            expect(radio('B')).toBeEnabled();
        });
    });

    describe('accessibility (axe)', () => {
        it.each([
            ['nothing selected', {}],
            ['selected', { defaultValue: 'metric' }],
            ['disabled', { disabled: true }],
        ])('has no violations: %s', async (_, props) => {
            const { container } = setup(props);
            await expectNoA11yViolations(container);
        });
    });
});
