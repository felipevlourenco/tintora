import './Spinner.css';

type SpinnerSizes = 'small' | 'medium' | 'large';
type SpinnerColors = 'accent' | 'current';

export interface SpinnerProps {
    size?: SpinnerSizes;
    /** `accent` uses the brand fill; `current` follows the surrounding text colour. */
    color?: SpinnerColors;
    /** The accessible name; set it to translate the label. @default 'Loading' */
    'aria-label'?: string;
}

// Stroke widths are in viewBox units, tuned so the line stays ~2-4px at every size.
export const SPINNER_SIZE_MAP = {
    small: { width: 16, height: 16, strokeWidth: 3.5 },
    medium: { width: 24, height: 24, strokeWidth: 3 },
    large: { width: 40, height: 40, strokeWidth: 2.4 },
} as const;

export function Spinner({
    size = 'medium',
    color = 'accent',
    'aria-label': ariaLabel = 'Loading',
}: SpinnerProps) {
    const { width, height, strokeWidth } = SPINNER_SIZE_MAP[size];
    return (
        <svg
            className="tintora-spinner"
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            role="img"
            aria-label={ariaLabel}
        >
            <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeOpacity={color === 'accent' ? 0.25 : 0.35}
                strokeWidth={strokeWidth}
            />
            <path
                d="M21 12a9 9 0 0 0-9-9"
                stroke={
                    color === 'accent'
                        ? 'var(--tintora-control-fill)'
                        : 'currentColor'
                }
                strokeWidth={strokeWidth}
                strokeLinecap="round"
            />
        </svg>
    );
}
