import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import {
    Card,
    SelectableCard,
    type CardProps,
    type SelectableCardProps,
} from './Card';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Card.css'), 'utf8');

const setup = (props: Partial<CardProps> = {}) =>
    render(
        <Card data-testid="card" {...props}>
            Fruits only
        </Card>,
    );

describe('Card', () => {
    it('renders its children', () => {
        setup();
        expect(screen.getByText('Fruits only')).toBeInTheDocument();
    });

    it('is an article of the surface variant by default', () => {
        setup();
        const card = screen.getByTestId('card');
        expect(card.tagName).toBe('ARTICLE');
        expect(card).toHaveClass('tintora-card', 'tintora-card--surface');
    });

    it('applies the row variant', () => {
        setup({ variant: 'row' });
        const card = screen.getByTestId('card');
        expect(card).toHaveClass('tintora-card--row');
        expect(card).not.toHaveClass('tintora-card--surface');
    });

    it.each(['div', 'section', 'article'] as const)('renders as %s', (as) => {
        setup({ as });
        expect(screen.getByTestId('card').tagName).toBe(as.toUpperCase());
    });

    it('renders as li inside a list', () => {
        render(
            <ul>
                <Card as="li" data-testid="card">
                    Cardio
                </Card>
            </ul>,
        );
        expect(screen.getByRole('listitem')).toBe(screen.getByTestId('card'));
    });

    it('merges a consumer className without dropping the library ones', () => {
        setup({ className: 'custom' });
        expect(screen.getByTestId('card')).toHaveClass(
            'tintora-card',
            'tintora-card--surface',
            'custom',
        );
    });

    it('forwards native props', () => {
        setup({ id: 'c', title: 'Meal', 'aria-label': 'Meal plan' });
        const card = screen.getByTestId('card');
        expect(card).toHaveAttribute('id', 'c');
        expect(card).toHaveAttribute('title', 'Meal');
        expect(card).toHaveAttribute('aria-label', 'Meal plan');
    });

    it('is not interactive', () => {
        setup();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('can hold its own controls, such as the row "more" button', () => {
        render(
            <Card variant="row">
                Cardio Workshop
                <button type="button">More options</button>
            </Card>,
        );
        expect(
            screen.getByRole('button', { name: 'More options' }),
        ).toBeInTheDocument();
    });

    describe('accessibility (axe)', () => {
        it.each(['surface', 'row'] as const)(
            'has no violations: %s',
            async (variant) => {
                const { container } = render(
                    <Card variant={variant}>
                        <h3>Calories</h3>
                        <p>1428 Kcal</p>
                    </Card>,
                );
                await expectNoA11yViolations(container);
            },
        );
    });

    describe('stylesheet', () => {
        it.each(['surface', 'row'])(
            'defines .tintora-card--%s exactly once',
            (name) => {
                const rule = new RegExp(`\\.tintora-card--${name}\\s*\\{`, 'g');
                expect(css.match(rule)).toHaveLength(1);
            },
        );
    });
});

const setupSelectable = (props: Partial<SelectableCardProps> = {}) =>
    render(<SelectableCard {...props}>Vegetables only</SelectableCard>);

describe('SelectableCard', () => {
    it('is a button named by its content', () => {
        setupSelectable();
        expect(
            screen.getByRole('button', { name: 'Vegetables only' }),
        ).toBeInTheDocument();
    });

    it('never submits a form by accident', () => {
        setupSelectable();
        expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('is a toggle that is not pressed by default', () => {
        setupSelectable();
        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('aria-pressed', 'false');
        expect(card).not.toHaveClass('tintora-card--selected');
    });

    it('is pressed and styled when selected', () => {
        setupSelectable({ selected: true });
        const card = screen.getByRole('button');
        expect(card).toHaveAttribute('aria-pressed', 'true');
        expect(card).toHaveClass(
            'tintora-card',
            'tintora-card--surface',
            'tintora-card--selectable',
            'tintora-card--selected',
        );
    });

    it('never uses aria-selected, which is invalid on a button', () => {
        setupSelectable({ selected: true });
        expect(screen.getByRole('button')).not.toHaveAttribute('aria-selected');
    });

    it('merges a consumer className and forwards native props', () => {
        setupSelectable({ className: 'custom', id: 's', title: 'Pick' });
        const card = screen.getByRole('button');
        expect(card).toHaveClass('tintora-card--selectable', 'custom');
        expect(card).toHaveAttribute('id', 's');
        expect(card).toHaveAttribute('title', 'Pick');
    });

    it('calls onClick on click, Enter and Space', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        setupSelectable({ onClick });
        await user.click(screen.getByRole('button'));
        await user.keyboard('{Enter}');
        await user.keyboard(' ');
        expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('does not fire onClick when disabled', async () => {
        const onClick = vi.fn();
        setupSelectable({ onClick, disabled: true });
        await userEvent.click(screen.getByRole('button'));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('works as an independent toggle', async () => {
        const user = userEvent.setup();
        function Demo() {
            const [selected, setSelected] = useState(false);
            return (
                <SelectableCard
                    selected={selected}
                    onClick={() => setSelected((s) => !s)}
                >
                    Day 2
                </SelectableCard>
            );
        }
        render(<Demo />);
        const card = screen.getByRole('button');
        await user.click(card);
        expect(card).toHaveAttribute('aria-pressed', 'true');
        await user.click(card);
        expect(card).toHaveAttribute('aria-pressed', 'false');
    });

    describe('accessibility (axe)', () => {
        it.each([false, true])(
            'has no violations: selected=%s',
            async (selected) => {
                const { container } = render(
                    <SelectableCard selected={selected}>
                        <strong>Fruits only</strong>
                        <span>High in water content.</span>
                    </SelectableCard>,
                );
                await expectNoA11yViolations(container);
            },
        );
    });

    describe('stylesheet', () => {
        it.each(['selectable', 'selected'])(
            'defines .tintora-card--%s exactly once',
            (name) => {
                const rule = new RegExp(`\\.tintora-card--${name}\\s*\\{`, 'g');
                expect(css.match(rule)).toHaveLength(1);
            },
        );

        it('turns a card Tag white-on-accent inside a selected card', () => {
            expect(css).toMatch(
                /\.tintora-card--selected\s+\.tintora-tag--card\s*\{[^}]*--tintora-chip-selected-bg/,
            );
        });

        it('only lifts a card that is not selected on hover', () => {
            expect(css).toMatch(
                /\.tintora-card--selectable:not\(\.tintora-card--selected\):hover\s*\{[^}]*translateY\(-3px\)/,
            );
        });

        it('keeps a visible focus ring', () => {
            expect(css).toMatch(
                /\.tintora-card--selectable:focus-visible\s*\{[^}]*outline/,
            );
        });
    });
});
