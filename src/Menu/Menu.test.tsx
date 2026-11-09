import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../Button/Button';
import { expectNoA11yViolations } from '../test-utils';
import { Menu, type MenuProps } from './Menu';
import { MenuItem, MenuSeparator } from './MenuItem';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Menu.css'), 'utf8');

const setup = (props: Partial<MenuProps> = {}, itemProps = {}) =>
    render(
        <Menu
            aria-label="Order actions"
            trigger={<Button variant="secondary">Actions</Button>}
            {...props}
        >
            <MenuItem {...itemProps}>Edit</MenuItem>
            <MenuItem disabled>Archive</MenuItem>
            <MenuSeparator />
            <MenuItem destructive>Delete</MenuItem>
        </Menu>,
    );

const trigger = () => screen.getByRole('button', { name: 'Actions' });
const menu = () => screen.getByRole('menu', { name: 'Order actions' });
const item = (name: string) => screen.getByRole('menuitem', { name });
const open = async () => userEvent.click(trigger());

describe('Menu', () => {
    describe('trigger', () => {
        it('is closed at first, with the popup announced', () => {
            setup();
            expect(trigger()).toHaveAttribute('aria-haspopup', 'menu');
            expect(trigger()).toHaveAttribute('aria-expanded', 'false');
            expect(trigger()).not.toHaveAttribute('aria-controls');
            expect(screen.queryByRole('menu')).toBeNull();
        });

        it('opens the menu on click and points at it', async () => {
            setup();
            await open();
            expect(menu()).toBeInTheDocument();
            expect(trigger()).toHaveAttribute('aria-expanded', 'true');
            expect(trigger()).toHaveAttribute('aria-controls', menu().id);
        });

        it('closes the menu when clicked again', async () => {
            setup();
            await open();
            await open();
            expect(screen.queryByRole('menu')).toBeNull();
        });

        it('keeps its own onClick', async () => {
            const onClick = vi.fn();
            setup({
                trigger: (
                    <Button variant="secondary" onClick={onClick}>
                        Actions
                    </Button>
                ),
            });
            await open();
            expect(onClick).toHaveBeenCalledOnce();
            expect(menu()).toBeInTheDocument();
        });

        it('opens on ArrowDown and focuses the first item', async () => {
            setup();
            trigger().focus();
            await userEvent.keyboard('{ArrowDown}');
            expect(menu()).toBeInTheDocument();
            expect(item('Edit')).toHaveFocus();
        });

        it('opens on ArrowUp and focuses the last item', async () => {
            setup();
            trigger().focus();
            await userEvent.keyboard('{ArrowUp}');
            expect(item('Delete')).toHaveFocus();
        });

        it('opens from the keyboard with Enter', async () => {
            setup();
            trigger().focus();
            await userEvent.keyboard('{Enter}');
            expect(menu()).toBeInTheDocument();
        });
    });

    describe('menu', () => {
        it('is named, and holds the items and a separator', async () => {
            setup();
            await open();
            expect(menu()).toHaveClass('tintora-menu');
            expect(screen.getAllByRole('menuitem')).toHaveLength(3);
            expect(screen.getByRole('separator')).toBeInTheDocument();
        });

        it('focuses the first item when opened with the mouse', async () => {
            setup();
            await open();
            expect(item('Edit')).toHaveFocus();
        });

        it('keeps the items out of the tab order (roving focus)', async () => {
            setup();
            await open();
            for (const el of screen.getAllByRole('menuitem')) {
                expect(el).toHaveAttribute('tabindex', '-1');
            }
        });

        it('keeps the consumer className', async () => {
            setup({ className: 'custom' });
            await open();
            expect(menu()).toHaveClass('tintora-menu', 'custom');
        });

        it('reports opening and closing', async () => {
            const onOpenChange = vi.fn();
            setup({ onOpenChange });
            await open();
            expect(onOpenChange).toHaveBeenLastCalledWith(true);
            await userEvent.keyboard('{Escape}');
            expect(onOpenChange).toHaveBeenLastCalledWith(false);
        });
    });

    describe('keyboard', () => {
        it('moves down and up through the items, skipping disabled ones', async () => {
            setup();
            await open();
            await userEvent.keyboard('{ArrowDown}');
            // Archive is disabled, so it goes straight to Delete.
            expect(item('Delete')).toHaveFocus();
            await userEvent.keyboard('{ArrowUp}');
            expect(item('Edit')).toHaveFocus();
        });

        it('wraps around at the ends', async () => {
            setup();
            await open();
            await userEvent.keyboard('{ArrowUp}');
            expect(item('Delete')).toHaveFocus();
            await userEvent.keyboard('{ArrowDown}');
            expect(item('Edit')).toHaveFocus();
        });

        it('jumps with Home and End', async () => {
            setup();
            await open();
            await userEvent.keyboard('{End}');
            expect(item('Delete')).toHaveFocus();
            await userEvent.keyboard('{Home}');
            expect(item('Edit')).toHaveFocus();
        });

        it('closes on Escape and returns focus to the trigger', async () => {
            setup();
            await open();
            await userEvent.keyboard('{Escape}');
            expect(screen.queryByRole('menu')).toBeNull();
            expect(trigger()).toHaveFocus();
        });

        it('closes on Tab', async () => {
            setup();
            await open();
            await userEvent.keyboard('{Tab}');
            expect(screen.queryByRole('menu')).toBeNull();
        });

        it('chooses the focused item with Enter', async () => {
            const onSelect = vi.fn();
            setup({}, { onSelect });
            await open();
            await userEvent.keyboard('{Enter}');
            expect(onSelect).toHaveBeenCalledOnce();
            expect(screen.queryByRole('menu')).toBeNull();
        });

        it('chooses the focused item with Space', async () => {
            const onSelect = vi.fn();
            setup({}, { onSelect });
            await open();
            await userEvent.keyboard(' ');
            expect(onSelect).toHaveBeenCalledOnce();
        });
    });

    describe('typeahead', () => {
        const setupMany = (onSelectCopy = vi.fn()) =>
            render(
                <Menu
                    aria-label="Order actions"
                    trigger={<Button variant="secondary">Actions</Button>}
                >
                    <MenuItem onSelect={onSelectCopy}>Copy link</MenuItem>
                    <MenuItem>Copy text</MenuItem>
                    <MenuItem>Duplicate</MenuItem>
                    <MenuItem disabled>Download</MenuItem>
                    <MenuItem>Delete</MenuItem>
                    <MenuItem>Details</MenuItem>
                </Menu>,
            );

        it('focuses the next item that starts with the typed letter', async () => {
            const user = userEvent.setup();
            setupMany();
            await user.click(trigger());
            await user.keyboard('d');
            expect(item('Duplicate')).toHaveFocus();
            await user.keyboard('d');
            expect(item('Delete')).toHaveFocus();
        });

        it('skips disabled items and wraps around', async () => {
            const user = userEvent.setup();
            setupMany();
            await user.click(trigger());
            await user.keyboard('ddd');
            expect(item('Details')).toHaveFocus();
            await user.keyboard('d');
            expect(item('Duplicate')).toHaveFocus();
        });

        it('narrows the match as more letters are typed', async () => {
            const user = userEvent.setup();
            setupMany();
            await user.click(trigger());
            await user.keyboard('det');
            expect(item('Details')).toHaveFocus();
        });

        it('starts a new search after a pause', async () => {
            // shouldAdvanceTime: Testing Library waits on a real timer, which
            // would never fire on a frozen clock (it only knows Jest's).
            vi.useFakeTimers({ shouldAdvanceTime: true });
            try {
                const user = userEvent.setup({
                    advanceTimers: vi.advanceTimersByTime,
                });
                setupMany();
                await user.click(trigger());
                await user.keyboard('d');
                expect(item('Duplicate')).toHaveFocus();
                await vi.advanceTimersByTimeAsync(1000);
                // Without the pause this would read "de" and land on Delete.
                await user.keyboard('c');
                expect(item('Copy link')).toHaveFocus();
            } finally {
                vi.useRealTimers();
            }
        });

        it('counts a space inside a search as a letter, not as a choice', async () => {
            const user = userEvent.setup();
            const onSelect = vi.fn();
            setupMany(onSelect);
            await user.click(trigger());
            await user.keyboard('copy t');
            expect(item('Copy text')).toHaveFocus();
            expect(onSelect).not.toHaveBeenCalled();
            expect(menu()).toBeInTheDocument();
        });

        it('still chooses with Space when no search is under way', async () => {
            const user = userEvent.setup();
            const onSelect = vi.fn();
            setupMany(onSelect);
            await user.click(trigger());
            await user.keyboard(' ');
            expect(onSelect).toHaveBeenCalledTimes(1);
        });

        it('stays where it is when nothing matches', async () => {
            const user = userEvent.setup();
            setupMany();
            await user.click(trigger());
            await user.keyboard('z');
            expect(item('Copy link')).toHaveFocus();
        });

        it('ignores keys pressed with a shortcut modifier', async () => {
            const user = userEvent.setup();
            setupMany();
            await user.click(trigger());
            await user.keyboard('{Control>}d{/Control}');
            expect(item('Copy link')).toHaveFocus();
        });
    });

    describe('items', () => {
        it('call onSelect, close the menu and return focus to the trigger', async () => {
            const onSelect = vi.fn();
            setup({}, { onSelect });
            await open();
            await userEvent.click(item('Edit'));
            expect(onSelect).toHaveBeenCalledOnce();
            expect(screen.queryByRole('menu')).toBeNull();
            expect(trigger()).toHaveFocus();
        });

        it('mark a disabled item and ignore its clicks', async () => {
            const onSelect = vi.fn();
            render(
                <Menu
                    aria-label="Order actions"
                    trigger={<Button variant="secondary">Actions</Button>}
                >
                    <MenuItem disabled onSelect={onSelect}>
                        Archive
                    </MenuItem>
                </Menu>,
            );
            await open();
            expect(item('Archive')).toHaveAttribute('aria-disabled', 'true');
            await userEvent.click(item('Archive'));
            expect(onSelect).not.toHaveBeenCalled();
            expect(menu()).toBeInTheDocument();
        });

        it('are plain buttons, so they do not submit a form', async () => {
            setup();
            await open();
            expect(item('Edit')).toHaveAttribute('type', 'button');
        });

        it('mark a destructive item', async () => {
            setup();
            await open();
            expect(item('Delete')).toHaveClass(
                'tintora-menu__item--destructive',
            );
            expect(item('Edit')).not.toHaveClass(
                'tintora-menu__item--destructive',
            );
        });

        it('show an icon hidden from assistive tech', async () => {
            render(
                <Menu
                    aria-label="Actions"
                    trigger={<Button variant="secondary">Open</Button>}
                >
                    <MenuItem icon={<svg data-testid="icon" />}>Edit</MenuItem>
                </Menu>,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Open' }));
            expect(
                screen.getByTestId('icon').closest('.tintora-menu__icon'),
            ).toHaveAttribute('aria-hidden', 'true');
            expect(item('Edit')).toBeInTheDocument();
        });

        it('take focus when the pointer moves over them', async () => {
            setup();
            await open();
            await userEvent.hover(item('Delete'));
            expect(item('Delete')).toHaveFocus();
        });

        it('do not leak onSelect or destructive to the DOM', async () => {
            setup();
            await open();
            expect(item('Delete')).not.toHaveAttribute('destructive');
            expect(item('Edit')).not.toHaveAttribute('onselect');
        });

        it('must be inside a Menu', () => {
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
            expect(() => render(<MenuItem>Edit</MenuItem>)).toThrow(
                'MenuItem must be rendered inside a Menu',
            );
            spy.mockRestore();
        });
    });

    describe('dismissal', () => {
        it('closes on a click outside', async () => {
            render(
                <>
                    <p>Elsewhere</p>
                    <Menu
                        aria-label="Order actions"
                        trigger={<Button variant="secondary">Actions</Button>}
                    >
                        <MenuItem>Edit</MenuItem>
                    </Menu>
                </>,
            );
            await open();
            await userEvent.click(screen.getByText('Elsewhere'));
            expect(screen.queryByRole('menu')).toBeNull();
        });
    });

    describe('stylesheet', () => {
        it('is at least as wide as its trigger, through a variable, so it measures what it renders', () => {
            expect(css).toMatch(
                /\.tintora-menu\s*\{[^}]*min-width:\s*max\(\s*180px,\s*var\(--tintora-menu-trigger-width/,
            );
        });

        it('highlights the focused item, which the pointer also focuses', () => {
            expect(css).toMatch(
                /\.tintora-menu__item:focus\s*\{[^}]*background:\s*var\(--tintora-menu-item-hover/,
            );
        });
    });

    describe('accessibility', () => {
        it('has no violations closed', async () => {
            const { container } = setup();
            await expectNoA11yViolations(container);
        });

        it('has no violations open', async () => {
            const { container } = setup();
            await open();
            await expectNoA11yViolations(container);
        });
    });
});
