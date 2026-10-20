import {
    useLayoutEffect,
    useState,
    type DependencyList,
    type RefObject,
} from 'react';

/**
 * Shows a `popover="manual"` element in the top layer (so no card clips it)
 * and returns where `place` says it goes. `place` measures the trigger and the
 * popup, so it runs once the popup is in the DOM, again when `deps` change,
 * and whenever the page scrolls or resizes, because the popup is fixed to the
 * viewport. The result is `null` while closed.
 */
export function useTopLayerPosition<T>(
    open: boolean,
    popupRef: RefObject<HTMLElement | null>,
    place: () => T | null,
    deps: DependencyList,
): T | null {
    const [position, setPosition] = useState<T | null>(null);

    useLayoutEffect(() => {
        const popup = popupRef.current;
        if (!open || !popup) {
            setPosition(null);
            return;
        }
        popup.showPopover();
        const update = () => setPosition(place());
        const onScroll = (event: Event) => {
            // Scrolling inside the popup does not move it.
            if (!popup.contains(event.target as Node)) update();
        };
        update();
        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', update);
        };
        // `place` is a fresh closure each render; `deps` says when it matters.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, popupRef, ...deps]);

    return position;
}
