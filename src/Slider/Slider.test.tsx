import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Slider, type SliderProps } from './Slider';

const setup = (props: Partial<SliderProps> = {}) =>
    render(<Slider aria-label="Price" {...props} />);
const slider = () => screen.getByRole('slider', { name: 'Price' });
const percent = () =>
    slider().style.getPropertyValue('--tintora-slider-percent');

describe('Slider', () => {
    it('is a range input named by aria-label', () => {
        setup();
        expect(slider()).toHaveAttribute('type', 'range');
        expect(slider()).toHaveClass('tintora-slider__input');
    });

    it('defaults to 0..100 by 1, starting at min', () => {
        setup();
        expect(slider()).toHaveAttribute('min', '0');
        expect(slider()).toHaveAttribute('max', '100');
        expect(slider()).toHaveAttribute('step', '1');
        expect(slider()).toHaveValue('0');
    });

    it('takes min, max, step and defaultValue', () => {
        setup({ min: 10, max: 50, step: 5, defaultValue: 30 });
        expect(slider()).toHaveAttribute('min', '10');
        expect(slider()).toHaveAttribute('max', '50');
        expect(slider()).toHaveAttribute('step', '5');
        expect(slider()).toHaveValue('30');
    });

    it('starts at min when min is above 0', () => {
        setup({ min: 20, max: 40 });
        expect(slider()).toHaveValue('20');
    });

    it('reports a number on change', () => {
        const onValueChange = vi.fn();
        setup({ onValueChange });
        fireEvent.change(slider(), { target: { value: '42' } });
        expect(onValueChange).toHaveBeenCalledExactlyOnceWith(42);
        expect(slider()).toHaveValue('42');
    });

    // Arrow keys, Home and End are native <input type="range"> behaviour,
    // which jsdom does not implement, so they are not tested here.

    it('does not change by itself when controlled', () => {
        const onValueChange = vi.fn();
        setup({ value: 10, onValueChange });
        fireEvent.change(slider(), { target: { value: '60' } });
        expect(onValueChange).toHaveBeenCalledWith(60);
        expect(slider()).toHaveValue('10');
    });

    it('follows the parent when controlled', () => {
        function Parent() {
            const [value, setValue] = useState(5);
            return (
                <Slider
                    aria-label="Price"
                    value={value}
                    onValueChange={setValue}
                />
            );
        }
        render(<Parent />);
        fireEvent.change(slider(), { target: { value: '77' } });
        expect(slider()).toHaveValue('77');
    });

    it('exposes how far along the track it is, for the filled part', () => {
        setup({ min: 0, max: 200, value: 50 });
        expect(percent()).toBe('25%');
    });

    it('is at 0% on an empty range', () => {
        setup({ min: 5, max: 5 });
        expect(percent()).toBe('0%');
    });

    it('shows the formatted value in an output, and reads it as value text', () => {
        setup({ defaultValue: 25, formatValue: (v) => `$${v}` });
        expect(screen.getByText('$25').tagName).toBe('OUTPUT');
        expect(slider()).toHaveAttribute('aria-valuetext', '$25');
    });

    it('has no output without formatValue', () => {
        const { container } = setup();
        expect(container.querySelector('output')).toBeNull();
    });

    it('disables the input', () => {
        setup({ disabled: true });
        expect(slider()).toBeDisabled();
    });

    it('keeps the consumer className on the wrapper', () => {
        const { container } = setup({ className: 'custom' });
        expect(container.firstChild).toHaveClass('tintora-slider', 'custom');
    });

    it('passes other attributes to the input', () => {
        setup({ id: 'price', name: 'price' });
        expect(slider()).toHaveAttribute('id', 'price');
        expect(slider()).toHaveAttribute('name', 'price');
    });

    it('has no accessibility violations', async () => {
        const { container } = setup({
            defaultValue: 30,
            formatValue: (v) => `${v}`,
        });
        await expectNoA11yViolations(container);
    });
});
