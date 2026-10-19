import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox, type CheckboxProps } from './Checkbox';
import { expectNoA11yViolations } from '../test-utils';

const setup = (props: Partial<CheckboxProps> = {}) =>
    render(
        <Checkbox
            {...({ 'aria-label': 'Accept', ...props } as CheckboxProps)}
        />,
    );

describe('Checkbox', () => {
    it('is a checkbox named by its aria-label', () => {
        setup();
        expect(
            screen.getByRole('checkbox', { name: 'Accept' }),
        ).toBeInTheDocument();
    });

    it('is unchecked by default and starts checked with defaultChecked', () => {
        const { unmount } = setup();
        expect(screen.getByRole('checkbox')).not.toBeChecked();
        unmount();
        setup({ defaultChecked: true });
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('forwards native props to the input and className to the wrapper', () => {
        const { container } = setup({ id: 'terms', className: 'custom' });
        expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'terms');
        expect(container.firstElementChild).toHaveClass(
            'tintora-checkbox',
            'custom',
        );
    });

    it('toggles on click and reports the new value when uncontrolled', async () => {
        const onCheckedChange = vi.fn();
        setup({ onCheckedChange });
        await userEvent.click(screen.getByRole('checkbox'));
        expect(screen.getByRole('checkbox')).toBeChecked();
        expect(onCheckedChange).toHaveBeenLastCalledWith(true);
        await userEvent.click(screen.getByRole('checkbox'));
        expect(screen.getByRole('checkbox')).not.toBeChecked();
        expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    });

    it('only changes when the parent updates checked when controlled', async () => {
        const onCheckedChange = vi.fn();
        setup({ checked: false, onCheckedChange });
        await userEvent.click(screen.getByRole('checkbox'));
        expect(onCheckedChange).toHaveBeenCalledWith(true);
        expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('follows the parent state', async () => {
        const Parent = () => {
            const [on, setOn] = useState(false);
            return (
                <Checkbox
                    aria-label="Accept"
                    checked={on}
                    onCheckedChange={setOn}
                />
            );
        };
        render(<Parent />);
        await userEvent.click(screen.getByRole('checkbox'));
        expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('is focusable and toggles with Space', async () => {
        const onCheckedChange = vi.fn();
        setup({ onCheckedChange });
        await userEvent.tab();
        expect(screen.getByRole('checkbox')).toHaveFocus();
        await userEvent.keyboard(' ');
        expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    describe('indeterminate', () => {
        it('is exposed as mixed', () => {
            setup({ indeterminate: true });
            expect(screen.getByRole('checkbox')).toBePartiallyChecked();
        });

        it('is not mixed by default', () => {
            setup();
            expect(screen.getByRole('checkbox')).not.toBePartiallyChecked();
        });

        it('stays mixed after a click until the parent clears it', async () => {
            const Parent = () => {
                const [mixed, setMixed] = useState(true);
                return (
                    <Checkbox
                        aria-label="Accept"
                        indeterminate={mixed}
                        onCheckedChange={() => setMixed(false)}
                    />
                );
            };
            render(<Parent />);
            expect(screen.getByRole('checkbox')).toBePartiallyChecked();
            await userEvent.click(screen.getByRole('checkbox'));
            expect(screen.getByRole('checkbox')).not.toBePartiallyChecked();
            expect(screen.getByRole('checkbox')).toBeChecked();
        });

        it('re-applies mixed if the parent keeps it set', async () => {
            setup({ indeterminate: true });
            await userEvent.click(screen.getByRole('checkbox'));
            expect(screen.getByRole('checkbox')).toBePartiallyChecked();
        });
    });

    describe('disabled', () => {
        it('ignores clicks and is skipped by Tab', async () => {
            const onCheckedChange = vi.fn();
            setup({ disabled: true, onCheckedChange });
            expect(screen.getByRole('checkbox')).toBeDisabled();
            await userEvent.click(screen.getByRole('checkbox'));
            expect(onCheckedChange).not.toHaveBeenCalled();
            await userEvent.tab();
            expect(screen.getByRole('checkbox')).not.toHaveFocus();
        });
    });

    describe('accessibility (axe)', () => {
        it.each([
            ['unchecked', {}],
            ['checked', { defaultChecked: true }],
            ['mixed', { indeterminate: true }],
            ['disabled', { disabled: true }],
        ])('has no violations: %s', async (_, props) => {
            const { container } = setup(props);
            await expectNoA11yViolations(container);
        });
    });
});
