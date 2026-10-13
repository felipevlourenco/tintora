import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../test-utils';
import { SearchInput, type SearchInputProps } from './SearchInput';

const setup = (props: Partial<SearchInputProps> = {}) =>
    render(<SearchInput aria-label="Search" {...props} />);

describe('SearchInput', () => {
    it('is a search box named by its aria-label', () => {
        setup();
        expect(
            screen.getByRole('searchbox', { name: 'Search' }),
        ).toBeInTheDocument();
    });

    it('is always type="search", even if a type is forced', () => {
        setup({ ...({ type: 'text' } as object) });
        expect(screen.getByRole('searchbox')).toHaveAttribute('type', 'search');
    });

    it('hides the decorative icon from assistive tech', () => {
        const { container } = setup();
        expect(container.querySelector('svg')).toHaveAttribute(
            'aria-hidden',
            'true',
        );
    });

    it('focuses the input when the icon or padding is clicked', async () => {
        const { container } = setup();
        await userEvent.click(container.querySelector('svg')!);
        expect(screen.getByRole('searchbox')).toHaveFocus();
    });

    it('accepts native props and lets the user type', async () => {
        const onChange = vi.fn();
        setup({ placeholder: 'Search something here...', onChange });
        const input = screen.getByRole('searchbox');
        expect(input).toHaveAttribute(
            'placeholder',
            'Search something here...',
        );
        await userEvent.type(input, 'cardio');
        expect(onChange).toHaveBeenCalledTimes(6);
        expect(input).toHaveValue('cardio');
    });

    it('puts className on the wrapper, not the input', () => {
        const { container } = setup({ className: 'custom' });
        expect(container.firstElementChild).toHaveClass(
            'tintora-search-input',
            'custom',
        );
        expect(screen.getByRole('searchbox')).not.toHaveClass('custom');
    });

    it('disables the input and dims the whole field', async () => {
        const onChange = vi.fn();
        const { container } = setup({ disabled: true, onChange });
        const input = screen.getByRole('searchbox');
        expect(input).toBeDisabled();
        expect(container.firstElementChild).toHaveClass(
            'tintora-search-input--disabled',
        );
        await userEvent.type(input, 'x');
        expect(onChange).not.toHaveBeenCalled();
    });

    describe('accessibility (axe)', () => {
        it.each([
            { name: 'empty', props: {} },
            { name: 'with placeholder', props: { placeholder: 'Search' } },
            { name: 'filled', props: { defaultValue: 'cardio' } },
            { name: 'disabled', props: { disabled: true } },
        ])('has no violations: $name', async ({ props }) => {
            const { container } = setup(props);
            await expectNoA11yViolations(container);
        });
    });

    it('requires an accessible name', () => {
        // @ts-expect-error there is no visible label, so aria-label is required
        const props: SearchInputProps = {};
        expect(props).toBeDefined();
    });
});
