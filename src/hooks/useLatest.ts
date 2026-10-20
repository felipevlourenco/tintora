import { useEffect, useRef } from 'react';

/**
 * A ref that always holds the latest `value`. Lets a long-lived listener or
 * timer call the newest callback without being torn down for each new one.
 */
export function useLatest<T>(value: T) {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
}
