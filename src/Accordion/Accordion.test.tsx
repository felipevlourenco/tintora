import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Accordion, AccordionItem } from './Accordion';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Accordion.css'), 'utf8');

const setup = () =>
    render(
        <Accordion data-testid="accordion">
            <AccordionItem title="Shipping">Ships in 2 days.</AccordionItem>
            <AccordionItem title="Returns" defaultOpen>
                Free for 30 days.
            </AccordionItem>
        </Accordion>,
    );

const item = (title: string) =>
    screen.getByText(title).closest('details') as HTMLDetailsElement;

describe('Accordion', () => {
    it('is a container with the Tintora class', () => {
        setup();
        expect(screen.getByTestId('accordion')).toHaveClass(
            'tintora-accordion',
        );
    });

    it('keeps the consumer className and passes attributes through', () => {
        render(<Accordion className="custom" id="faq" />);
        const el = document.getElementById('faq')!;
        expect(el).toHaveClass('tintora-accordion', 'custom');
    });
});

describe('AccordionItem', () => {
    it('is a details element with its title in the summary', () => {
        setup();
        expect(item('Shipping').tagName).toBe('DETAILS');
        expect(item('Shipping').querySelector('summary')).toHaveTextContent(
            'Shipping',
        );
        expect(item('Shipping')).toHaveClass('tintora-accordion__item');
    });

    it('keeps the content in the panel', () => {
        setup();
        expect(
            item('Shipping').querySelector('.tintora-accordion__panel'),
        ).toHaveTextContent('Ships in 2 days.');
    });

    it('is closed by default, and open with defaultOpen', () => {
        setup();
        expect(item('Shipping')).not.toHaveAttribute('open');
        expect(item('Returns')).toHaveAttribute('open');
    });

    it('opens and closes when the summary is clicked', async () => {
        setup();
        await userEvent.click(screen.getByText('Shipping'));
        expect(item('Shipping')).toHaveAttribute('open');
        await userEvent.click(screen.getByText('Shipping'));
        expect(item('Shipping')).not.toHaveAttribute('open');
    });

    // Keyboard (Tab, then Enter or Space on the summary) is native <details>
    // behaviour. jsdom does not implement it, so it is not tested here.

    it('passes the name through, to group items so only one stays open', () => {
        render(
            <>
                <AccordionItem title="A" name="faq">
                    a
                </AccordionItem>
                <AccordionItem title="B" name="faq">
                    b
                </AccordionItem>
            </>,
        );
        expect(item('A')).toHaveAttribute('name', 'faq');
        expect(item('B')).toHaveAttribute('name', 'faq');
    });

    it('does not leak defaultOpen to the DOM', () => {
        setup();
        expect(item('Returns')).not.toHaveAttribute('defaultopen');
    });

    it('hides the chevron from assistive tech', () => {
        setup();
        expect(
            item('Shipping').querySelector('.tintora-accordion__chevron'),
        ).toHaveAttribute('aria-hidden', 'true');
    });

    it('keeps the consumer className', () => {
        render(
            <AccordionItem title="A" className="custom">
                a
            </AccordionItem>,
        );
        expect(item('A')).toHaveClass('tintora-accordion__item', 'custom');
    });

    it('has no accessibility violations', async () => {
        const { container } = setup();
        await expectNoA11yViolations(container);
    });
});

describe('Accordion animation', () => {
    it('animates the panel height through ::details-content', () => {
        expect(css).toMatch(
            /::details-content\s*\{[^}]*transition:[^;]*block-size/,
        );
        expect(css).toMatch(
            /\[open\]::details-content\s*\{[^}]*block-size:\s*auto/,
        );
    });

    it('only animates when motion is allowed', () => {
        expect(css).toMatch(
            /@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{[^@]*::details-content/,
        );
    });
});
