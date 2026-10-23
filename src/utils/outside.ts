import { MouseEvent } from 'react';

export function isOutsideElementClicked(
    event: MouseEvent,
    callback: () => void,
) {
    if (event.target !== event.currentTarget) {
        return;
    }
    // A scrim click targets the dialog too, but so does its own
    // padding; only a click outside its box is the scrim. The
    // target check above skips keyboard clicks, which report 0,0.
    const { left, right, top, bottom } =
        event.currentTarget.getBoundingClientRect();
    if (
        event.clientX < left ||
        event.clientX > right ||
        event.clientY < top ||
        event.clientY > bottom
    ) {
        callback();
    }
}
