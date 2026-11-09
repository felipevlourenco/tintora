import type { HTMLAttributes } from 'react';
import { clsx } from '../utils/clsx';
import './Rating.css';
import { Star } from './Star';

export interface RatingProps extends Omit<
    HTMLAttributes<HTMLSpanElement>,
    'children'
> {
    /** The score, from 0 to `max`. It can be fractional: 4.5 fills half a star. */
    value: number;
    /** @default 5 */
    max?: number;
    /** How many ratings there are. Shown as "(212)" next to the stars. */
    count?: number;
    /**
     * The stars' accessible name. Set it to translate it.
     * @default 'Rated {value} out of {max}'
     */
    'aria-label'?: string;
}

/**
 * A read-only star rating. The size follows the font size. For a rating the
 * user can set, see `RatingInput`.
 */
export function Rating({
    value,
    max = 5,
    count,
    className,
    'aria-label': ariaLabel,
    ...props
}: RatingProps) {
    const score = Math.min(Math.max(value, 0), max);
    const stars = Array.from({ length: max }, (_, i) => <Star key={i} />);

    return (
        <span {...props} className={clsx('tintora-rating', className)}>
            <span
                role="img"
                aria-label={ariaLabel ?? `Rated ${score} out of ${max}`}
                className="tintora-rating__stars"
            >
                <span className="tintora-rating__track">{stars}</span>
                <span
                    className="tintora-rating__fill"
                    style={{ width: `${(score / max) * 100}%` }}
                >
                    {stars}
                </span>
            </span>
            {count !== undefined && (
                <span className="tintora-rating__count">({count})</span>
            )}
        </span>
    );
}
