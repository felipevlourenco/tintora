import { useEffect } from 'react';
import { useLatest } from './useLatest';

/** Calls `onEscape` when Escape is pressed anywhere, while `active`. */
export function useEscapeKey(active: boolean, onEscape: () => void) {
    const handler = useLatest(onEscape);
    useEffect(() => {
        if (!active) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handler.current();
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [active, handler]);
}
