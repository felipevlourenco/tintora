import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Tab } from './Tab';
import { Tabs } from './Tabs';

const daily = () => screen.getByRole('tab', { name: 'Daily' });
const weekly = () => screen.getByRole('tab', { name: 'Weekly' });
const yearly = () => screen.getByRole('tab', { name: 'Yearly' });

const setup = (
    props: {
        variant?: 'segmented' | 'underline';
        onValueChange?: () => void;
    } = {},
    yearlyDisabled = false,
) =>
    render(
        <Tabs aria-label="Range" defaultValue="weekly" {...props}>
            <Tab value="daily">Daily</Tab>
            <Tab value="weekly">Weekly</Tab>
            <Tab value="yearly" disabled={yearlyDisabled}>
                Yearly
            </Tab>
        </Tabs>,
    );

describe('Tabs', () => {
    describe('structure', () => {
        it('renders a named tab list of tabs', () => {
            setup();
            expect(
                screen.getByRole('tablist', { name: 'Range' }),
            ).toBeInTheDocument();
            expect(screen.getAllByRole('tab')).toHaveLength(3);
        });

        it('marks only the selected tab', () => {
            setup();
            expect(weekly()).toHaveAttribute('aria-selected', 'true');
            expect(daily()).toHaveAttribute('aria-selected', 'false');
            expect(yearly()).toHaveAttribute('aria-selected', 'false');
        });

        it('makes only the selected tab a tab stop', () => {
            setup();
            expect(weekly()).toHaveAttribute('tabindex', '0');
            expect(daily()).toHaveAttribute('tabindex', '-1');
        });

        it('defaults to segmented and takes a variant', () => {
            const { unmount } = setup();
            expect(screen.getByRole('tablist')).toHaveClass(
                'tintora-tabs--segmented',
            );
            unmount();
            setup({ variant: 'underline' });
            expect(screen.getByRole('tablist')).toHaveClass(
                'tintora-tabs--underline',
            );
        });

        it('merges className and passes other props through', () => {
            render(
                <Tabs
                    aria-label="Range"
                    defaultValue="a"
                    className="extra"
                    data-testid="tabs"
                >
                    <Tab value="a">A</Tab>
                </Tabs>,
            );
            expect(screen.getByTestId('tabs')).toHaveClass(
                'tintora-tabs',
                'extra',
            );
        });

        it('throws when a Tab is rendered outside Tabs', () => {
            vi.spyOn(console, 'error').mockImplementation(() => {});
            expect(() => render(<Tab value="a">A</Tab>)).toThrow(
                'Tab must be rendered inside Tabs',
            );
        });
    });

    describe('selecting', () => {
        it('selects a clicked tab when uncontrolled and reports it', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange });
            await userEvent.click(daily());
            expect(daily()).toHaveAttribute('aria-selected', 'true');
            expect(weekly()).toHaveAttribute('aria-selected', 'false');
            expect(onValueChange).toHaveBeenCalledWith('daily');
        });

        it('does not report a click on the selected tab', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange });
            await userEvent.click(weekly());
            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('stays put when controlled until the parent changes the value', async () => {
            const onValueChange = vi.fn();
            render(
                <Tabs
                    aria-label="Range"
                    value="weekly"
                    onValueChange={onValueChange}
                >
                    <Tab value="daily">Daily</Tab>
                    <Tab value="weekly">Weekly</Tab>
                </Tabs>,
            );
            await userEvent.click(daily());
            expect(onValueChange).toHaveBeenCalledWith('daily');
            expect(weekly()).toHaveAttribute('aria-selected', 'true');
        });

        it('follows the parent when controlled', async () => {
            function Parent() {
                const [value, setValue] = useState('weekly');
                return (
                    <Tabs
                        aria-label="Range"
                        value={value}
                        onValueChange={setValue}
                    >
                        <Tab value="daily">Daily</Tab>
                        <Tab value="weekly">Weekly</Tab>
                    </Tabs>
                );
            }
            render(<Parent />);
            await userEvent.click(daily());
            expect(daily()).toHaveAttribute('aria-selected', 'true');
        });

        it('does not select a disabled tab', async () => {
            const onValueChange = vi.fn();
            setup({ onValueChange }, true);
            await userEvent.click(yearly());
            expect(onValueChange).not.toHaveBeenCalled();
            expect(weekly()).toHaveAttribute('aria-selected', 'true');
        });

        it('lets a tab onClick call preventDefault to veto the selection', async () => {
            render(
                <Tabs aria-label="Range" defaultValue="a">
                    <Tab value="a">A</Tab>
                    <Tab value="b" onClick={(event) => event.preventDefault()}>
                        B
                    </Tab>
                </Tabs>,
            );
            await userEvent.click(screen.getByRole('tab', { name: 'B' }));
            expect(screen.getByRole('tab', { name: 'A' })).toHaveAttribute(
                'aria-selected',
                'true',
            );
        });
    });

    describe('keyboard', () => {
        it('moves to the next tab with ArrowRight, selecting it', async () => {
            setup();
            weekly().focus();
            await userEvent.keyboard('{ArrowRight}');
            expect(yearly()).toHaveFocus();
            expect(yearly()).toHaveAttribute('aria-selected', 'true');
        });

        it('moves to the previous tab with ArrowLeft', async () => {
            setup();
            weekly().focus();
            await userEvent.keyboard('{ArrowLeft}');
            expect(daily()).toHaveFocus();
            expect(daily()).toHaveAttribute('aria-selected', 'true');
        });

        it('wraps around at both ends', async () => {
            setup();
            daily().focus();
            await userEvent.click(daily());
            await userEvent.keyboard('{ArrowLeft}');
            expect(yearly()).toHaveFocus();
            await userEvent.keyboard('{ArrowRight}');
            expect(daily()).toHaveFocus();
        });

        it('jumps to the first and last tab with Home and End', async () => {
            setup();
            weekly().focus();
            await userEvent.keyboard('{End}');
            expect(yearly()).toHaveFocus();
            await userEvent.keyboard('{Home}');
            expect(daily()).toHaveFocus();
        });

        it('skips disabled tabs', async () => {
            setup({}, true);
            weekly().focus();
            await userEvent.keyboard('{ArrowRight}');
            expect(daily()).toHaveFocus();
        });

        it('lets Tab leave the row instead of cycling through the tabs', async () => {
            render(
                <>
                    <Tabs aria-label="Range" defaultValue="weekly">
                        <Tab value="daily">Daily</Tab>
                        <Tab value="weekly">Weekly</Tab>
                    </Tabs>
                    <button type="button">After</button>
                </>,
            );
            weekly().focus();
            await userEvent.tab();
            expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
        });
    });

    describe('a11y', () => {
        it.each(['segmented', 'underline'] as const)(
            'has no violations as %s',
            async (variant) => {
                const { container } = setup({ variant }, true);
                await expectNoA11yViolations(container);
            },
        );
    });
});
