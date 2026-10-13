import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { Tag, type TagProps } from './Tag';

// Vitest blanks CSS imports, so read the stylesheet source directly.
const css = readFileSync(join(import.meta.dirname, 'Tag.css'), 'utf8');

const variants = ['neutral', 'success', 'accent', 'card'] as const;
const sizes = ['small', 'medium', 'large'] as const;

const setup = (props: Partial<TagProps> = {}) =>
    render(<Tag {...props}>Fitness</Tag>);

describe('Tag', () => {
    it('renders its label', () => {
        setup();
        expect(screen.getByText('Fitness')).toBeInTheDocument();
    });

    it('is a plain label: a span, not a control', () => {
        setup();
        expect(screen.getByText('Fitness').tagName).toBe('SPAN');
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('is neutral and medium by default', () => {
        setup();
        expect(screen.getByText('Fitness')).toHaveClass(
            'tintora-tag',
            'tintora-tag--neutral',
            'tintora-tag--medium',
        );
    });

    it.each(variants)('applies the %s variant', (variant) => {
        setup({ variant });
        expect(screen.getByText('Fitness')).toHaveClass(
            `tintora-tag--${variant}`,
        );
    });

    it.each(sizes)('applies the %s size', (size) => {
        setup({ size });
        expect(screen.getByText('Fitness')).toHaveClass(`tintora-tag--${size}`);
    });

    it('applies exactly one variant and one size', () => {
        setup({ variant: 'success', size: 'large' });
        const { className } = screen.getByText('Fitness');
        expect(
            className.match(/tintora-tag--(neutral|success|accent|card)/g),
        ).toHaveLength(1);
        expect(
            className.match(/tintora-tag--(small|medium|large)/g),
        ).toHaveLength(1);
    });

    it('merges a consumer className without dropping the library ones', () => {
        setup({ className: 'custom' });
        expect(screen.getByText('Fitness')).toHaveClass(
            'tintora-tag',
            'tintora-tag--neutral',
            'custom',
        );
    });

    it('forwards native props', () => {
        setup({
            id: 'tag',
            title: 'Category',
            'data-testid': 'tag',
        } as Partial<TagProps>);
        const tag = screen.getByTestId('tag');
        expect(tag).toHaveAttribute('id', 'tag');
        expect(tag).toHaveAttribute('title', 'Category');
    });

    it('renders rich children', () => {
        render(
            <Tag>
                <strong>New</strong> in
            </Tag>,
        );
        expect(screen.getByText('New').tagName).toBe('STRONG');
    });

    // jsdom does not load stylesheets, so check the source: every variant and
    // size the component can emit must have exactly one rule. A duplicated
    // selector once let one variant silently override another.
    describe('stylesheet', () => {
        it.each([...variants, ...sizes])(
            'defines .tintora-tag--%s exactly once',
            (name) => {
                const rule = new RegExp(`\\.tintora-tag--${name}\\s*\\{`, 'g');
                expect(css.match(rule)).toHaveLength(1);
            },
        );
    });

    describe('accessibility (axe)', () => {
        it.each(variants)('has no violations: %s', async (variant) => {
            const { container } = setup({ variant });
            await expectNoA11yViolations(container);
        });

        it.each(sizes)('has no violations: %s', async (size) => {
            const { container } = setup({ size });
            await expectNoA11yViolations(container);
        });
    });

    it('requires children', () => {
        // @ts-expect-error a tag needs a label
        const props: TagProps = {};
        expect(props).toBeDefined();
    });
});
