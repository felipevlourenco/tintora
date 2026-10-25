type ClassValue =
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined
    | Record<string, unknown>;

/**
 * Joins class names, skipping falsy values; an object keeps the keys whose
 * value is truthy. Numbers and booleans are skipped, so `cond && 'a'` is safe
 * when `cond` is `0` or `true`. The subset of the `clsx` package this library uses, so it
 * ships with no dependencies.
 */
export function clsx(...values: ClassValue[]): string {
    return values
        .flatMap((value) =>
            typeof value === 'string' && value
                ? [value]
                : value && typeof value === 'object'
                  ? Object.keys(value).filter((key) => value[key])
                  : [],
        )
        .join(' ');
}
