import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch, type SwitchProps } from './Switch';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<SwitchProps> = {}) =>
    render(
        <Switch {...({ 'aria-label': 'Wi-Fi', ...props } as SwitchProps)} />,
    );

describe('Switch', () => {
    it('is a switch named by its aria-label', () => {
        setup();
        expect(
            screen.getByRole('switch', { name: 'Wi-Fi' }),
        ).toBeInTheDocument();
    });

    it('is off by default and starts on with defaultChecked', () => {
        const { unmount } = setup();
        expect(screen.getByRole('switch')).not.toBeChecked();
        unmount();
        setup({ defaultChecked: true });
        expect(screen.getByRole('switch')).toBeChecked();
    });

    it('forwards native props to the input and className to the wrapper', () => {
        const { container } = setup({ id: 'wifi', className: 'custom' });
        expect(screen.getByRole('switch')).toHaveAttribute('id', 'wifi');
        expect(container.firstElementChild).toHaveClass(
            'tintora-switch',
            'custom',
        );
    });

    describe('uncontrolled', () => {
        it('toggles on click and reports the new value', async () => {
            const onCheckedChange = vi.fn();
            setup({ onCheckedChange });
            await userEvent.click(screen.getByRole('switch'));
            expect(screen.getByRole('switch')).toBeChecked();
            expect(onCheckedChange).toHaveBeenLastCalledWith(true);
            await userEvent.click(screen.getByRole('switch'));
            expect(screen.getByRole('switch')).not.toBeChecked();
            expect(onCheckedChange).toHaveBeenLastCalledWith(false);
            expect(onCheckedChange).toHaveBeenCalledTimes(2);
        });
    });

    describe('controlled', () => {
        it('only changes when the parent updates checked', async () => {
            const onCheckedChange = vi.fn();
            setup({ checked: false, onCheckedChange });
            await userEvent.click(screen.getByRole('switch'));
            expect(onCheckedChange).toHaveBeenCalledWith(true);
            expect(screen.getByRole('switch')).not.toBeChecked();
        });

        it('follows the parent state', async () => {
            const Parent = () => {
                const [on, setOn] = useState(false);
                return (
                    <Switch
                        aria-label="Wi-Fi"
                        checked={on}
                        onCheckedChange={setOn}
                    />
                );
            };
            render(<Parent />);
            await userEvent.click(screen.getByRole('switch'));
            expect(screen.getByRole('switch')).toBeChecked();
        });
    });

    describe('keyboard', () => {
        it('is focusable and toggles with Space', async () => {
            const onCheckedChange = vi.fn();
            setup({ onCheckedChange });
            await userEvent.tab();
            expect(screen.getByRole('switch')).toHaveFocus();
            await userEvent.keyboard(' ');
            expect(onCheckedChange).toHaveBeenCalledWith(true);
        });
    });

    describe('disabled', () => {
        it('ignores clicks and is skipped by Tab', async () => {
            const onCheckedChange = vi.fn();
            setup({ disabled: true, onCheckedChange });
            expect(screen.getByRole('switch')).toBeDisabled();
            await userEvent.click(screen.getByRole('switch'));
            expect(onCheckedChange).not.toHaveBeenCalled();
            await userEvent.tab();
            expect(screen.getByRole('switch')).not.toHaveFocus();
        });
    });

    describe('accessibility (axe)', () => {
        it.each([
            ['off', {}],
            ['on', { defaultChecked: true }],
            ['disabled', { disabled: true }],
        ])('has no violations: %s', async (_, props) => {
            const { container } = setup(props);
            await expectNoA11yViolations(container);
        });
    });
});
