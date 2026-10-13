import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Toggle, type ToggleProps } from './Toggle';
import { ToggleItem, type ToggleItemProps } from './ToggleItem';

type Theme = 'light' | 'dark';

// The props are a union of two modes. Tests pass them loosely; the compile-time
// checks at the bottom prove the real types reject bad combinations.
type LooseProps = Partial<Record<string, unknown>>;

const items = [
    <ToggleItem key="light" value="light" aria-label="Light">
        <svg />
    </ToggleItem>,
    <ToggleItem key="dark" value="dark" aria-label="Dark">
        <svg />
    </ToggleItem>,
];

/** Uncontrolled and starting on "light", unless the test passes `value`. */
const setup = (props: LooseProps = {}) => {
    const mode = 'value' in props ? {} : { defaultValue: 'light' };
    return render(
        <Toggle<Theme>
            {...({
                'aria-label': 'Theme',
                ...mode,
                ...props,
                children: items,
            } as unknown as ToggleProps<Theme>)}
        />,
    );
};
const light = () => screen.getByRole('button', { name: 'Light' });
const dark = () => screen.getByRole('button', { name: 'Dark' });

describe('Toggle', () => {
    it('is a named group of two buttons', () => {
        setup();
        expect(
            screen.getByRole('group', { name: 'Theme' }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole('button')).toHaveLength(2);
        expect(light()).toHaveAttribute('type', 'button');
    });

    it('starts on defaultValue', () => {
        setup({ defaultValue: 'dark' });
        expect(dark()).toHaveAttribute('aria-pressed', 'true');
        expect(light()).toHaveAttribute('aria-pressed', 'false');
    });

    it('moves the selection on click and reports it (uncontrolled)', async () => {
        const onValueChange = vi.fn();
        setup({ onValueChange });
        await userEvent.click(dark());
        expect(dark()).toHaveAttribute('aria-pressed', 'true');
        expect(light()).toHaveAttribute('aria-pressed', 'false');
        expect(onValueChange).toHaveBeenCalledExactlyOnceWith('dark');
    });

    it('does not report a click on the selected item', async () => {
        const onValueChange = vi.fn();
        setup({ onValueChange });
        await userEvent.click(light());
        expect(onValueChange).not.toHaveBeenCalled();
        expect(light()).toHaveAttribute('aria-pressed', 'true');
    });

    it('stays on the controlled value until the parent changes it', async () => {
        const onValueChange = vi.fn();
        setup({ value: 'light', onValueChange });
        await userEvent.click(dark());
        expect(onValueChange).toHaveBeenCalledWith('dark');
        expect(light()).toHaveAttribute('aria-pressed', 'true');
    });

    it('follows the parent when controlled', async () => {
        const Parent = () => {
            const [theme, setTheme] = useState<Theme>('light');
            return (
                <Toggle<Theme>
                    aria-label="Theme"
                    value={theme}
                    onValueChange={setTheme}
                >
                    <ToggleItem value="light" aria-label="Light">
                        <svg />
                    </ToggleItem>
                    <ToggleItem value="dark" aria-label="Dark">
                        <svg />
                    </ToggleItem>
                </Toggle>
            );
        };
        render(<Parent />);
        await userEvent.click(dark());
        expect(dark()).toHaveAttribute('aria-pressed', 'true');
    });

    it('is operable with the keyboard', async () => {
        const onValueChange = vi.fn();
        setup({ onValueChange });
        await userEvent.tab();
        await userEvent.tab();
        expect(dark()).toHaveFocus();
        await userEvent.keyboard('{Enter}');
        expect(onValueChange).toHaveBeenCalledWith('dark');
    });

    it('disables every item when the group is disabled', async () => {
        const onValueChange = vi.fn();
        setup({ disabled: true, onValueChange });
        expect(light()).toBeDisabled();
        expect(dark()).toBeDisabled();
        expect(screen.getByRole('group')).toHaveClass(
            'tintora-toggle--disabled',
        );
        await userEvent.click(dark());
        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('lets one item be disabled on its own', () => {
        render(
            <Toggle aria-label="Theme" defaultValue="light">
                <ToggleItem value="light" aria-label="Light">
                    <svg />
                </ToggleItem>
                <ToggleItem value="dark" aria-label="Dark" disabled>
                    <svg />
                </ToggleItem>
            </Toggle>,
        );
        expect(dark()).toBeDisabled();
        expect(light()).toBeEnabled();
    });

    it('still calls a native onClick, and honours preventDefault', async () => {
        const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault());
        const onValueChange = vi.fn();
        render(
            <Toggle
                aria-label="Theme"
                defaultValue="light"
                onValueChange={onValueChange}
            >
                <ToggleItem value="light" aria-label="Light">
                    <svg />
                </ToggleItem>
                <ToggleItem value="dark" aria-label="Dark" onClick={onClick}>
                    <svg />
                </ToggleItem>
            </Toggle>,
        );
        await userEvent.click(dark());
        expect(onClick).toHaveBeenCalledOnce();
        expect(onValueChange).not.toHaveBeenCalled();
    });

    it('merges classNames and forwards native props', () => {
        render(
            <Toggle
                aria-label="Theme"
                defaultValue="a"
                className="custom"
                data-testid="toggle"
            >
                <ToggleItem value="a" aria-label="A" className="item">
                    <svg />
                </ToggleItem>
                <ToggleItem value="b" aria-label="B">
                    <svg />
                </ToggleItem>
            </Toggle>,
        );
        expect(screen.getByTestId('toggle')).toHaveClass(
            'tintora-toggle',
            'custom',
        );
        expect(screen.getByRole('button', { name: 'A' })).toHaveClass(
            'tintora-toggle__item',
            'item',
        );
    });

    it('names text items by their text', () => {
        render(
            <Toggle aria-label="View" defaultValue="day">
                <ToggleItem value="day">Day</ToggleItem>
                <ToggleItem value="week">Week</ToggleItem>
            </Toggle>,
        );
        expect(screen.getByRole('button', { name: 'Day' })).toBeInTheDocument();
    });

    it('throws a clear error when an item is used outside a Toggle', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() =>
            render(
                <ToggleItem value="a" aria-label="A">
                    <svg />
                </ToggleItem>,
            ),
        ).toThrow('ToggleItem must be rendered inside a Toggle');
        spy.mockRestore();
    });

    describe('accessibility (axe)', () => {
        it.each([
            { name: 'default', props: {} },
            { name: 'second selected', props: { defaultValue: 'dark' } },
            { name: 'disabled', props: { disabled: true } },
        ] as const)('has no violations: $name', async ({ props }) => {
            const { container } = setup({ ...props });
            await expectNoA11yViolations(container);
        });
    });

    it('is checked by the compiler', () => {
        const item = (
            <ToggleItem value="a" aria-label="A">
                <svg />
            </ToggleItem>
        );
        const pair: ToggleProps['children'] = [item, item];
        const noop = () => {};
        const named = { 'aria-label': 'x' };
        const owned = { ...named, defaultValue: 'a' };

        // @ts-expect-error exactly two items: one is not enough
        const one: ToggleProps = { ...owned, children: [item] };
        // @ts-expect-error exactly two items: three are too many
        const many: ToggleProps = { ...owned, children: [item, item, item] };
        // @ts-expect-error the group needs an accessible name
        const unnamed: ToggleProps = { defaultValue: 'a', children: pair };
        // @ts-expect-error an icon-only item needs an aria-label
        const icon: ToggleItemProps = { value: 'a', children: <svg /> };

        // @ts-expect-error pass value or defaultValue: neither is not allowed
        const neither: ToggleProps = { ...named, children: pair };
        const both = { ...named, value: 'a', onValueChange: noop };
        // @ts-expect-error pass value or defaultValue: both is not allowed
        const twice: ToggleProps = {
            ...both,
            defaultValue: 'a',
            children: pair,
        };
        // @ts-expect-error a controlled Toggle needs onValueChange to ever change
        const stuck: ToggleProps = { ...named, value: 'a', children: pair };

        // These are the two valid modes.
        const controlled: ToggleProps = { ...both, children: pair };
        const uncontrolled: ToggleProps = { ...owned, children: pair };

        expect([
            one,
            many,
            unnamed,
            icon,
            neither,
            twice,
            stuck,
            controlled,
            uncontrolled,
        ]).toHaveLength(9);
    });
});
