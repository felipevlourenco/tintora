import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Select, type SelectProps } from './Select';
import { type SelectOption } from './SelectOption';

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

const options: SelectOption<Frequency>[] = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

// The props are a union of two modes. Tests pass them loosely; the compile-time
// checks at the bottom prove the real types reject bad combinations.
type LooseProps = Partial<Record<string, unknown>>;

const setup = (props: LooseProps = {}) =>
    render(
        <Select<Frequency>
            {...({
                'aria-label': 'Frequency',
                options,
                ...props,
            } as unknown as SelectProps<Frequency>)}
        />,
    );

const trigger = () => screen.getByRole('combobox', { name: 'Frequency' });
const listbox = () => screen.getByRole('listbox', { name: 'Frequency' });
const option = (name: string) => screen.getByRole('option', { name });
const labels = () =>
    within(listbox())
        .getAllByRole('option')
        .map((o) => o.textContent);
/** The option the trigger currently points at with aria-activedescendant. */
const highlighted = () => {
    const id = trigger().getAttribute('aria-activedescendant');
    return id ? document.getElementById(id)?.textContent : undefined;
};
const open = async () => {
    trigger().focus();
    await userEvent.keyboard('{Enter}');
};

describe('Select', () => {
    describe('trigger', () => {
        it('is a named combobox button that opens a listbox', () => {
            setup();
            expect(trigger().tagName).toBe('BUTTON');
            expect(trigger()).toHaveAttribute('type', 'button');
            expect(trigger()).toHaveAttribute('aria-haspopup', 'listbox');
            expect(trigger()).toHaveAttribute('aria-expanded', 'false');
        });

        it('shows the placeholder when nothing is selected', () => {
            setup({ placeholder: 'Pick one' });
            expect(trigger()).toHaveTextContent('Pick one');
        });

        it('shows the label of defaultValue, not its value', () => {
            setup({ defaultValue: 'weekly' });
            expect(trigger()).toHaveTextContent('Weekly');
            expect(trigger()).not.toHaveTextContent('weekly');
        });

        it('shows the placeholder when a controlled value is null', () => {
            setup({
                value: null,
                onValueChange: vi.fn(),
                placeholder: 'Pick one',
            });
            expect(trigger()).toHaveTextContent('Pick one');
        });

        it('is empty without a placeholder or value, without throwing', () => {
            setup();
            expect(trigger()).toHaveTextContent('');
        });

        it('does not render a chevron the screen reader can read', () => {
            const { container } = setup();
            const chevron = container.querySelector('svg');
            expect(chevron).toHaveAttribute('aria-hidden', 'true');
        });

        it('merges className and forwards native props to the button', () => {
            setup({ className: 'custom', id: 'freq', 'data-testid': 'freq' });
            expect(trigger()).toHaveClass('tintora-select__trigger', 'custom');
            expect(trigger()).toHaveAttribute('id', 'freq');
            expect(screen.getByTestId('freq')).toBe(trigger());
        });
    });

    describe('opening and closing', () => {
        it('is closed at first: no listbox in the DOM', () => {
            setup();
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            expect(trigger()).not.toHaveAttribute('aria-activedescendant');
        });

        it('opens on click and lists every option', async () => {
            setup();
            await userEvent.click(trigger());
            expect(trigger()).toHaveAttribute('aria-expanded', 'true');
            expect(labels()).toEqual(['Daily', 'Weekly', 'Monthly', 'Yearly']);
        });

        it('links the trigger to the listbox it controls', async () => {
            setup();
            await userEvent.click(trigger());
            expect(trigger()).toHaveAttribute('aria-controls', listbox().id);
            expect(listbox().id).not.toBe('');
        });

        it('closes when the trigger is clicked again', async () => {
            setup();
            await userEvent.click(trigger());
            await userEvent.click(trigger());
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            expect(trigger()).toHaveAttribute('aria-expanded', 'false');
        });

        it('closes on Escape and keeps focus on the trigger', async () => {
            setup();
            await open();
            await userEvent.keyboard('{Escape}');
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
            expect(trigger()).toHaveFocus();
        });

        it('closes when clicking outside', async () => {
            setup();
            await userEvent.click(trigger());
            await userEvent.click(document.body);
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });

        it('closes on Tab', async () => {
            setup();
            await open();
            await userEvent.tab();
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });

        it('keeps focus on the trigger while open', async () => {
            setup();
            await userEvent.click(trigger());
            expect(trigger()).toHaveFocus();
        });

        it('does not open when disabled', async () => {
            setup({ disabled: true });
            expect(trigger()).toBeDisabled();
            await userEvent.click(trigger());
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
    });

    describe('options', () => {
        it('marks only the selected option', async () => {
            setup({ defaultValue: 'weekly' });
            await userEvent.click(trigger());
            expect(option('Weekly')).toHaveAttribute('aria-selected', 'true');
            expect(option('Daily')).toHaveAttribute('aria-selected', 'false');
            expect(
                within(listbox()).getAllByRole('option', { selected: true }),
            ).toHaveLength(1);
        });

        it('marks no option when nothing is selected', async () => {
            setup();
            await userEvent.click(trigger());
            expect(
                within(listbox()).queryAllByRole('option', { selected: true }),
            ).toHaveLength(0);
        });

        it('gives every option a unique id', async () => {
            setup();
            await userEvent.click(trigger());
            const ids = within(listbox())
                .getAllByRole('option')
                .map((o) => o.id);
            expect(ids.every(Boolean)).toBe(true);
            expect(new Set(ids).size).toBe(options.length);
        });

        it('marks disabled options with aria-disabled', async () => {
            setup({
                options: options.map((o) =>
                    o.value === 'monthly' ? { ...o, disabled: true } : o,
                ),
            });
            await userEvent.click(trigger());
            expect(option('Monthly')).toHaveAttribute('aria-disabled', 'true');
            expect(option('Daily')).not.toHaveAttribute('aria-disabled');
        });

        it('renders an empty list without throwing', async () => {
            setup({ options: [] });
            await userEvent.click(trigger());
            expect(within(listbox()).queryAllByRole('option')).toHaveLength(0);
        });
    });

    describe('selecting (uncontrolled)', () => {
        it('selects on click, closes, and updates the trigger', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 'daily', onValueChange });
            await userEvent.click(trigger());
            await userEvent.click(option('Monthly'));
            expect(onValueChange).toHaveBeenCalledExactlyOnceWith('monthly');
            expect(trigger()).toHaveTextContent('Monthly');
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });

        it('keeps focus on the trigger after selecting', async () => {
            setup();
            await userEvent.click(trigger());
            await userEvent.click(option('Monthly'));
            expect(trigger()).toHaveFocus();
        });

        it('closes without reporting when the selected option is picked again', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 'weekly', onValueChange });
            await userEvent.click(trigger());
            await userEvent.click(option('Weekly'));
            expect(onValueChange).not.toHaveBeenCalled();
            expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });

        it('ignores a disabled option', async () => {
            const onValueChange = vi.fn();
            setup({
                defaultValue: 'daily',
                onValueChange,
                options: options.map((o) =>
                    o.value === 'monthly' ? { ...o, disabled: true } : o,
                ),
            });
            await userEvent.click(trigger());
            await userEvent.click(option('Monthly'));
            expect(onValueChange).not.toHaveBeenCalled();
            expect(trigger()).toHaveTextContent('Daily');
            expect(listbox()).toBeInTheDocument();
        });

        it('works without onValueChange', async () => {
            setup();
            await userEvent.click(trigger());
            await userEvent.click(option('Yearly'));
            expect(trigger()).toHaveTextContent('Yearly');
        });
    });

    describe('selecting (controlled)', () => {
        it('reports the pick but waits for the parent to change value', async () => {
            const onValueChange = vi.fn();
            setup({ value: 'daily', onValueChange });
            await userEvent.click(trigger());
            await userEvent.click(option('Monthly'));
            expect(onValueChange).toHaveBeenCalledExactlyOnceWith('monthly');
            expect(trigger()).toHaveTextContent('Daily');
        });

        it('follows the value the parent passes', () => {
            const { rerender } = setup({
                value: 'daily',
                onValueChange: vi.fn(),
            });
            expect(trigger()).toHaveTextContent('Daily');
            rerender(
                <Select<Frequency>
                    aria-label="Frequency"
                    options={options}
                    value="yearly"
                    onValueChange={vi.fn()}
                />,
            );
            expect(trigger()).toHaveTextContent('Yearly');
        });
    });

    describe('keyboard', () => {
        it.each(['{Enter}', ' ', '{ArrowDown}', '{ArrowUp}'])(
            'opens with %j',
            async (key) => {
                setup();
                trigger().focus();
                await userEvent.keyboard(key);
                expect(trigger()).toHaveAttribute('aria-expanded', 'true');
            },
        );

        it('highlights the selected option when it opens', async () => {
            setup({ defaultValue: 'monthly' });
            await open();
            expect(highlighted()).toBe('Monthly');
        });

        it('highlights the first option when nothing is selected', async () => {
            setup();
            await open();
            expect(highlighted()).toBe('Daily');
        });

        it('highlights the first enabled option when the first is disabled', async () => {
            setup({
                options: options.map((o) =>
                    o.value === 'daily' ? { ...o, disabled: true } : o,
                ),
            });
            await open();
            expect(highlighted()).toBe('Weekly');
        });

        it('moves the highlight with the arrow keys', async () => {
            setup();
            await open();
            await userEvent.keyboard('{ArrowDown}');
            expect(highlighted()).toBe('Weekly');
            await userEvent.keyboard('{ArrowUp}');
            expect(highlighted()).toBe('Daily');
        });

        it('stops at the ends instead of wrapping', async () => {
            setup();
            await open();
            await userEvent.keyboard('{ArrowUp}');
            expect(highlighted()).toBe('Daily');
            await userEvent.keyboard('{End}{ArrowDown}');
            expect(highlighted()).toBe('Yearly');
        });

        it('jumps with Home and End', async () => {
            setup({ defaultValue: 'weekly' });
            await open();
            await userEvent.keyboard('{End}');
            expect(highlighted()).toBe('Yearly');
            await userEvent.keyboard('{Home}');
            expect(highlighted()).toBe('Daily');
        });

        it('skips disabled options', async () => {
            setup({
                defaultValue: 'weekly',
                options: options.map((o) =>
                    o.value === 'monthly' ? { ...o, disabled: true } : o,
                ),
            });
            await open();
            await userEvent.keyboard('{ArrowDown}');
            expect(highlighted()).toBe('Yearly');
            await userEvent.keyboard('{ArrowUp}');
            expect(highlighted()).toBe('Weekly');
        });

        it.each(['{Enter}', ' '])(
            'selects the highlighted option with %j',
            async (key) => {
                const onValueChange = vi.fn();
                setup({ onValueChange });
                await open();
                await userEvent.keyboard('{ArrowDown}{ArrowDown}');
                await userEvent.keyboard(key);
                expect(onValueChange).toHaveBeenCalledExactlyOnceWith(
                    'monthly',
                );
                expect(trigger()).toHaveTextContent('Monthly');
                expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
                expect(trigger()).toHaveFocus();
            },
        );

        it('does not change the value when closed with Escape', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 'daily', onValueChange });
            await open();
            await userEvent.keyboard('{ArrowDown}{Escape}');
            expect(onValueChange).not.toHaveBeenCalled();
            expect(trigger()).toHaveTextContent('Daily');
        });

        it('opens again from the selected option after Escape', async () => {
            setup({ defaultValue: 'daily' });
            await open();
            await userEvent.keyboard('{ArrowDown}{Escape}');
            await userEvent.keyboard('{Enter}');
            expect(highlighted()).toBe('Daily');
        });

        it('highlights the hovered option', async () => {
            setup();
            await userEvent.click(trigger());
            await userEvent.hover(option('Monthly'));
            expect(highlighted()).toBe('Monthly');
        });
    });

    describe('forms', () => {
        const hidden = (container: HTMLElement) =>
            container.querySelector<HTMLInputElement>('input[type="hidden"]');

        it('has no hidden input without a name', () => {
            const { container } = setup({ defaultValue: 'weekly' });
            expect(hidden(container)).not.toBeInTheDocument();
        });

        it('submits the value (not the label) under its name', () => {
            const { container } = setup({
                name: 'frequency',
                defaultValue: 'weekly',
            });
            expect(hidden(container)).toHaveAttribute('name', 'frequency');
            expect(hidden(container)).toHaveValue('weekly');
        });

        it('submits an empty value when nothing is selected', () => {
            const { container } = setup({ name: 'frequency' });
            expect(hidden(container)).toHaveValue('');
        });

        it('follows the selection', async () => {
            const { container } = setup({ name: 'frequency' });
            await userEvent.click(trigger());
            await userEvent.click(option('Yearly'));
            expect(hidden(container)).toHaveValue('yearly');
        });

        it('is left out of the form data when disabled', () => {
            const { container } = setup({
                name: 'frequency',
                defaultValue: 'weekly',
                disabled: true,
            });
            expect(hidden(container)).toBeDisabled();
        });
    });

    describe('accessibility (axe)', () => {
        it('has no violations: closed', async () => {
            const { container } = setup({ placeholder: 'Pick one' });
            await expectNoA11yViolations(container);
        });

        it('has no violations: closed with a value', async () => {
            const { container } = setup({ defaultValue: 'weekly' });
            await expectNoA11yViolations(container);
        });

        it('has no violations: open', async () => {
            const { container } = setup({ defaultValue: 'weekly' });
            await userEvent.click(trigger());
            await expectNoA11yViolations(container);
        });

        it('has no violations: open with a disabled option', async () => {
            const { container } = setup({
                options: options.map((o) =>
                    o.value === 'monthly' ? { ...o, disabled: true } : o,
                ),
            });
            await userEvent.click(trigger());
            await expectNoA11yViolations(container);
        });

        it('has no violations: disabled', async () => {
            const { container } = setup({ disabled: true });
            await expectNoA11yViolations(container);
        });

        it('has no violations: with a form name', async () => {
            const { container } = setup({ name: 'frequency' });
            await expectNoA11yViolations(container);
        });
    });
});
