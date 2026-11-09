import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { type SelectOption } from '../Select/SelectOption';
import { expectNoA11yViolations } from '../test-utils';
import { Combobox, type ComboboxProps } from './Combobox';

type City = 'sp' | 'rj' | 'bh' | 'bsb' | 'ssa';

const options: SelectOption<City>[] = [
    { value: 'sp', label: 'São Paulo' },
    { value: 'rj', label: 'Rio de Janeiro' },
    { value: 'bh', label: 'Belo Horizonte' },
    { value: 'bsb', label: 'Brasília', disabled: true },
    { value: 'ssa', label: 'Salvador' },
];

// The props are a union of two modes. Tests pass them loosely; the compile-time
// checks at the bottom prove the real types reject bad combinations.
type LooseProps = Partial<Record<string, unknown>>;

const setup = (props: LooseProps = {}) =>
    render(
        <Combobox<City>
            {...({
                label: 'City',
                options,
                ...props,
            } as unknown as ComboboxProps<City>)}
        />,
    );

const input = () => screen.getByRole('combobox', { name: 'City' });
const listbox = () => screen.getByRole('listbox', { name: 'City' });
const option = (name: string) => screen.getByRole('option', { name });
const labels = () =>
    within(listbox())
        .getAllByRole('option')
        .map((o) => o.textContent);
/** The option the input currently points at with aria-activedescendant. */
const highlighted = () => {
    const id = input().getAttribute('aria-activedescendant');
    return id ? document.getElementById(id)?.textContent : undefined;
};

describe('Combobox', () => {
    describe('field', () => {
        it('is a labelled text field that offers a list', () => {
            setup();
            expect(input()).toBeInstanceOf(HTMLInputElement);
            expect(input()).toHaveAttribute('aria-autocomplete', 'list');
            expect(input()).toHaveAttribute('aria-expanded', 'false');
            expect(input()).not.toHaveAttribute('aria-controls');
            expect(screen.queryByRole('listbox')).toBeNull();
        });

        it('shows a placeholder while nothing is chosen', () => {
            setup({ placeholder: 'Pick a city' });
            expect(input()).toHaveAttribute('placeholder', 'Pick a city');
            expect(input()).toHaveValue('');
        });

        it('shows the label of the chosen option', () => {
            setup({ defaultValue: 'rj' });
            expect(input()).toHaveValue('Rio de Janeiro');
        });

        it('describes the field with its hint', () => {
            setup({ hint: 'Where you live' });
            expect(input()).toHaveAccessibleDescription('Where you live');
        });

        it('shows an error in place of the hint and marks the field invalid', () => {
            setup({ hint: 'Where you live', error: 'Pick a city' });
            expect(input()).toHaveAccessibleDescription('Pick a city');
            expect(input()).toBeInvalid();
        });

        it('keeps the consumer className on its root', () => {
            const { container } = setup({ className: 'mine' });
            expect(container.firstElementChild).toHaveClass('mine');
        });

        it('passes other props to the input', () => {
            const onFocus = vi.fn();
            setup({ id: 'city', required: true, onFocus });
            expect(input()).toHaveAttribute('id', 'city');
            expect(input()).toBeRequired();
            input().focus();
            expect(onFocus).toHaveBeenCalledTimes(1);
        });
    });

    describe('opening', () => {
        it('opens on click, and points at the list', async () => {
            setup();
            await userEvent.click(input());
            expect(listbox()).toBeInTheDocument();
            expect(input()).toHaveAttribute('aria-expanded', 'true');
            expect(input()).toHaveAttribute('aria-controls', listbox().id);
        });

        it('stays open when clicked again, so the caret can be placed', async () => {
            setup();
            await userEvent.click(input());
            await userEvent.click(input());
            expect(listbox()).toBeInTheDocument();
        });

        it('opens on ArrowDown and ArrowUp', async () => {
            setup();
            input().focus();
            await userEvent.keyboard('{ArrowDown}');
            expect(listbox()).toBeInTheDocument();
            await userEvent.keyboard('{Escape}{ArrowUp}');
            expect(listbox()).toBeInTheDocument();
        });

        it('opens when typing', async () => {
            setup();
            await userEvent.type(input(), 'r');
            expect(listbox()).toBeInTheDocument();
        });

        it('lists every option, even with one chosen', async () => {
            setup({ defaultValue: 'rj' });
            await userEvent.click(input());
            expect(labels()).toEqual(options.map((o) => o.label));
        });

        it('marks the chosen option, and starts on it', async () => {
            setup({ defaultValue: 'bh' });
            await userEvent.click(input());
            expect(option('Belo Horizonte')).toHaveAttribute(
                'aria-selected',
                'true',
            );
            expect(highlighted()).toBe('Belo Horizonte');
        });

        it('does not open when disabled', async () => {
            setup({ disabled: true });
            expect(input()).toBeDisabled();
            await userEvent.click(input());
            expect(screen.queryByRole('listbox')).toBeNull();
        });
    });

    describe('filtering', () => {
        it('narrows the list as the user types', async () => {
            setup();
            await userEvent.type(input(), 'rio');
            expect(labels()).toEqual(['Rio de Janeiro']);
        });

        it('matches anywhere in the label, ignoring case', async () => {
            setup();
            await userEvent.type(input(), 'HORIZ');
            expect(labels()).toEqual(['Belo Horizonte']);
        });

        it('ignores accents, in what is typed and in the labels', async () => {
            setup();
            await userEvent.type(input(), 'sao');
            expect(labels()).toEqual(['São Paulo']);
            await userEvent.clear(input());
            await userEvent.type(input(), 'brasilia');
            expect(labels()).toEqual(['Brasília']);
        });

        it('lists everything again when the text is cleared', async () => {
            setup();
            await userEvent.type(input(), 'rio');
            await userEvent.clear(input());
            expect(labels()).toHaveLength(options.length);
        });

        it('says so when nothing matches, in place of the list', async () => {
            setup();
            await userEvent.type(input(), 'zzz');
            expect(screen.queryByRole('listbox')).toBeNull();
            expect(screen.getByRole('status')).toHaveTextContent('No results');
            // "Expanded" describes the list, and there is none to point at.
            expect(input()).toHaveAttribute('aria-expanded', 'false');
            expect(input()).not.toHaveAttribute('aria-controls');
            expect(input()).not.toHaveAttribute('aria-activedescendant');
        });

        it('takes the no-results text as a prop, so it can be translated', async () => {
            setup({ emptyLabel: 'Nenhum resultado' });
            await userEvent.type(input(), 'zzz');
            expect(screen.getByRole('status')).toHaveTextContent(
                'Nenhum resultado',
            );
        });
    });

    describe('keyboard', () => {
        it('moves through the options, skipping disabled ones, and stops at the ends', async () => {
            setup();
            await userEvent.click(input());
            expect(highlighted()).toBe('São Paulo');
            await userEvent.keyboard('{ArrowDown}');
            expect(highlighted()).toBe('Rio de Janeiro');
            await userEvent.keyboard('{ArrowDown}');
            expect(highlighted()).toBe('Belo Horizonte');
            await userEvent.keyboard('{ArrowDown}');
            expect(highlighted()).toBe('Salvador');
            await userEvent.keyboard('{ArrowDown}');
            expect(highlighted()).toBe('Salvador');
            await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}{ArrowUp}');
            expect(highlighted()).toBe('São Paulo');
        });

        it('highlights the first match while typing', async () => {
            setup();
            await userEvent.type(input(), 'sa');
            expect(highlighted()).toBe('São Paulo');
        });

        it('chooses the highlighted option with Enter', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange });
            await userEvent.type(input(), 'sal{Enter}');
            expect(onValueChange).toHaveBeenCalledWith('ssa');
            expect(onValueChange).toHaveBeenCalledTimes(1);
            expect(input()).toHaveValue('Salvador');
            expect(screen.queryByRole('listbox')).toBeNull();
        });

        it('does not submit a form when Enter chooses an option', async () => {
            const onSubmit = vi.fn((event) => event.preventDefault());
            render(
                <form onSubmit={onSubmit}>
                    <Combobox<City> label="City" options={options} />
                </form>,
            );
            await userEvent.type(input(), 'rio{Enter}');
            expect(onSubmit).not.toHaveBeenCalled();
        });

        it('leaves Enter to the form when the list is closed', async () => {
            const onSubmit = vi.fn((event) => event.preventDefault());
            render(
                <form onSubmit={onSubmit}>
                    <Combobox<City> label="City" options={options} />
                    <button type="submit">Save</button>
                </form>,
            );
            input().focus();
            await userEvent.keyboard('{Enter}');
            expect(onSubmit).toHaveBeenCalledTimes(1);
        });

        it('closes on Escape and puts the chosen label back', async () => {
            setup({ defaultValue: 'rj' });
            await userEvent.type(input(), 'xyz');
            await userEvent.keyboard('{Escape}');
            expect(screen.queryByRole('listbox')).toBeNull();
            expect(input()).toHaveValue('Rio de Janeiro');
            expect(input()).toHaveFocus();
        });

        it('leaves Home and End to the text caret', async () => {
            setup();
            await userEvent.type(input(), 'rio');
            const home = fireEvent.keyDown(input(), { key: 'Home' });
            const end = fireEvent.keyDown(input(), { key: 'End' });
            // fireEvent returns false when the handler called preventDefault.
            expect(home).toBe(true);
            expect(end).toBe(true);
        });
    });

    describe('choosing', () => {
        it('chooses an option on click and shows its label', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange });
            await userEvent.click(input());
            await userEvent.click(option('Belo Horizonte'));
            expect(onValueChange).toHaveBeenCalledWith('bh');
            expect(input()).toHaveValue('Belo Horizonte');
            expect(screen.queryByRole('listbox')).toBeNull();
            expect(input()).toHaveFocus();
        });

        it('ignores a disabled option', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange });
            await userEvent.click(input());
            await userEvent.click(option('Brasília'));
            expect(onValueChange).not.toHaveBeenCalled();
            expect(listbox()).toBeInTheDocument();
        });

        it('does not report choosing the option that is already chosen', async () => {
            const onValueChange = vi.fn();
            setup({ defaultValue: 'rj', onValueChange });
            await userEvent.click(input());
            await userEvent.click(option('Rio de Janeiro'));
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('puts the chosen label back when focus leaves with text half typed', async () => {
            setup({ defaultValue: 'rj' });
            await userEvent.type(input(), 'xyz');
            await userEvent.tab();
            expect(screen.queryByRole('listbox')).toBeNull();
            expect(input()).toHaveValue('Rio de Janeiro');
        });

        it('clears half-typed text on leaving when nothing was chosen', async () => {
            setup();
            await userEvent.type(input(), 'rio');
            await userEvent.tab();
            expect(input()).toHaveValue('');
        });

        it('keeps the consumer onBlur', async () => {
            const onBlur = vi.fn();
            setup({ onBlur });
            input().focus();
            await userEvent.tab();
            expect(onBlur).toHaveBeenCalledTimes(1);
        });
    });

    describe('controlled', () => {
        it('shows the value it is given and reports a choice without changing it', async () => {
            const onValueChange = vi.fn();
            setup({ value: 'sp', onValueChange });
            expect(input()).toHaveValue('São Paulo');
            await userEvent.click(input());
            await userEvent.click(option('Salvador'));
            expect(onValueChange).toHaveBeenCalledWith('ssa');
            expect(input()).toHaveValue('São Paulo');
        });

        it('follows the parent when the value changes', () => {
            const { rerender } = setup({ value: 'sp', onValueChange: vi.fn() });
            rerender(
                <Combobox<City>
                    label="City"
                    options={options}
                    value="rj"
                    onValueChange={vi.fn()}
                />,
            );
            expect(input()).toHaveValue('Rio de Janeiro');
        });
    });

    describe('forms', () => {
        it('submits the value, not the label, through a hidden input', () => {
            const { container } = setup({ name: 'city', defaultValue: 'rj' });
            const hidden = container.querySelector<HTMLInputElement>(
                'input[type="hidden"]',
            );
            expect(hidden).toHaveAttribute('name', 'city');
            expect(hidden).toHaveValue('rj');
            // The visible input must not submit the label under that name.
            expect(input()).not.toHaveAttribute('name');
        });

        it('has no hidden input without a name', () => {
            const { container } = setup();
            expect(container.querySelector('input[type="hidden"]')).toBeNull();
        });
    });

    describe('accessibility', () => {
        it('has no violations closed', async () => {
            const { container } = setup({ hint: 'Where you live' });
            await expectNoA11yViolations(container);
        });

        it('has no violations open', async () => {
            const { container } = setup();
            await userEvent.click(input());
            await expectNoA11yViolations(container);
        });

        it('has no violations with nothing found', async () => {
            const { container } = setup();
            await userEvent.type(input(), 'zzz');
            await expectNoA11yViolations(container);
        });
    });
});

// Compile-time checks: these only need to type-check, never to run.
// @ts-expect-error a controlled combobox needs onValueChange
void (() => <Combobox label="City" options={options} value="sp" />);
void (() => (
    <Combobox
        label="City"
        options={options}
        value="sp"
        // @ts-expect-error value and defaultValue are mutually exclusive
        defaultValue="rj"
        onValueChange={() => {}}
    />
));
