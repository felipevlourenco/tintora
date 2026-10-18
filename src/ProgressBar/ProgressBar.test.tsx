import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
import { expectNoA11yViolations } from '../test-utils';

const fill = () =>
    screen.getByRole('progressbar').firstElementChild as HTMLElement;

describe('ProgressBar', () => {
    it('is named by its visible title', () => {
        render(<ProgressBar title="Weekly ring" progress={80} />);
        expect(
            screen.getByRole('progressbar', { name: 'Weekly ring' }),
        ).toBeInTheDocument();
    });

    it('can be named by aria-label when there is no title', () => {
        render(<ProgressBar aria-label="Upload" progress={60} />);
        expect(
            screen.getByRole('progressbar', { name: 'Upload' }),
        ).toBeInTheDocument();
        expect(screen.queryByText('60%')).not.toBeInTheDocument();
    });

    it('exposes the value and sizes the fill to it', () => {
        render(<ProgressBar title="Steps" progress={40} />);
        const bar = screen.getByRole('progressbar');
        expect(bar).toHaveAttribute('aria-valuemin', '0');
        expect(bar).toHaveAttribute('aria-valuemax', '100');
        expect(bar).toHaveAttribute('aria-valuenow', '40');
        expect(fill()).toHaveStyle({ width: '40%' });
        expect(fill()).not.toHaveClass(
            'tintora-progress-bar__fill--indeterminate',
        );
        expect(screen.getByText('40%')).toBeInTheDocument();
    });

    it('renders 0 as "0%" instead of dropping it', () => {
        render(<ProgressBar title="Steps" progress={0} />);
        expect(screen.getByText('0%')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-valuenow',
            '0',
        );
    });

    it.each([
        [150, 100],
        [-20, 0],
        [NaN, 0],
    ])('clamps %s to %s', (progress, expected) => {
        render(<ProgressBar title="Steps" progress={progress} />);
        expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-valuenow',
            String(expected),
        );
    });

    it('shows a custom value label and exposes it as aria-valuetext', () => {
        render(
            <ProgressBar
                title="Steps"
                progress={40}
                valueLabel="4,000 / 10,000"
            />,
        );
        expect(screen.getByText('4,000 / 10,000')).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toHaveAttribute(
            'aria-valuetext',
            '4,000 / 10,000',
        );
    });

    it('marks 100% as complete', () => {
        render(<ProgressBar title="Goal" progress={100} />);
        expect(fill()).toHaveClass('tintora-progress-bar__fill--complete');
    });

    it('does not mark anything under 100% as complete', () => {
        render(<ProgressBar title="Goal" progress={99} />);
        expect(fill()).not.toHaveClass('tintora-progress-bar__fill--complete');
    });

    describe('indeterminate', () => {
        it('animates and omits the value attributes', () => {
            render(<ProgressBar title="Syncing" indeterminate />);
            const bar = screen.getByRole('progressbar');
            expect(bar).not.toHaveAttribute('aria-valuenow');
            expect(bar).not.toHaveAttribute('aria-valuemin');
            expect(bar).not.toHaveAttribute('aria-valuemax');
            expect(fill()).toHaveClass(
                'tintora-progress-bar__fill--indeterminate',
            );
            expect(screen.getByText('Indeterminate')).toBeInTheDocument();
        });
    });

    describe('accessibility (axe)', () => {
        it('has no violations: determinate', async () => {
            const { container } = render(
                <ProgressBar title="Steps" progress={40} />,
            );
            await expectNoA11yViolations(container);
        });

        it('has no violations: indeterminate', async () => {
            const { container } = render(
                <ProgressBar title="Syncing" indeterminate />,
            );
            await expectNoA11yViolations(container);
        });

        it('has no violations: aria-label only', async () => {
            const { container } = render(
                <ProgressBar aria-label="Upload" progress={60} />,
            );
            await expectNoA11yViolations(container);
        });
    });
});
