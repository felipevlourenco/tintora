import { useEffect, type RefObject } from 'react';
import { useLatest } from './useLatest';

/**
 * Calls `onPress` when a pointer goes down outside `ref`, while `active`.
 * A `popover="manual"` has no light dismiss of its own, so components add it.
 */
export function useOutsidePress(
    active: boolean,
    ref: RefObject<HTMLElement | null>,
    onPress: () => void,
) {
    const handler = useLatest(onPress);
    useEffect(() => {
        if (!active) return;
        const onPointerDown = (event: Event) => {
            if (!ref.current?.contains(event.target as Node)) {
                handler.current();
            }
        };
        document.addEventListener('pointerdown', onPointerDown);
        return () => document.removeEventListener('pointerdown', onPointerDown);
    }, [active, ref, handler]);
}
