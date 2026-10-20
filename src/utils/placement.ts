/** Where to put a popup (tooltip, popover) next to its trigger. */
export type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface PlacementOptions {
    /** Space between the anchor and the popup (an arrow sits inside it). */
    gap: number;
    /** Closest the popup may get to a viewport edge. */
    margin: number;
    /** Keeps the arrow clear of the popup's rounded corners. */
    arrowInset: number;
}

const DEFAULTS: PlacementOptions = { gap: 10, margin: 8, arrowInset: 12 };

export interface Size {
    width: number;
    height: number;
}

export interface Position {
    top: number;
    left: number;
    /** The side it really opens on: the requested one, or the opposite if flipped. */
    placement: Placement;
    /** Distance in px from the popup's start edge to the arrow's centre. */
    arrowOffset: number;
}

const OPPOSITE: Record<Placement, Placement> = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
};

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));

/**
 * The side the popup should open on: the requested one when it fits in the
 * viewport, otherwise the opposite one. `OPPOSITE` maps each side to its pair.
 */
function pickPlacement(
    anchor: DOMRect,
    tooltip: Size,
    placement: Placement,
    viewport: Size,
    { gap, margin }: PlacementOptions,
): Placement {
    const roomOn = (side: Placement) => {
        switch (side) {
            case 'top':
                return anchor.top;
            case 'bottom':
                return viewport.height - anchor.bottom;
            case 'left':
                return anchor.left;
            case 'right':
                return viewport.width - anchor.right;
        }
    };
    const vertical = placement === 'top' || placement === 'bottom';
    const needed = (vertical ? tooltip.height : tooltip.width) + gap + margin;
    const here = roomOn(placement);

    // Flip only when it does not fit here and the other side has more room.
    return here >= needed || roomOn(OPPOSITE[placement]) <= here
        ? placement
        : OPPOSITE[placement];
}

/**
 * Viewport coordinates for the popup's top-left corner, given the trigger's
 * rect, the popup's own size, the side it should open on and the viewport.
 * It flips to the opposite side when there is no room, and is kept inside the
 * viewport along the other axis (the arrow then moves to keep pointing at the
 * trigger).
 */
export function getPosition(
    anchor: DOMRect,
    tooltip: Size,
    requested: Placement,
    viewport: Size = { width: window.innerWidth, height: window.innerHeight },
    options: Partial<PlacementOptions> = {},
): Position {
    const opts = { ...DEFAULTS, ...options };
    const { gap, margin, arrowInset } = opts;
    const placement = pickPlacement(anchor, tooltip, requested, viewport, opts);
    const vertical = placement === 'top' || placement === 'bottom';

    let top: number;
    let left: number;
    switch (placement) {
        case 'top':
            top = anchor.y - tooltip.height - gap;
            left = anchor.x + anchor.width / 2 - tooltip.width / 2;
            break;
        case 'bottom':
            top = anchor.y + anchor.height + gap;
            left = anchor.x + anchor.width / 2 - tooltip.width / 2;
            break;
        case 'left':
            top = anchor.y + anchor.height / 2 - tooltip.height / 2;
            left = anchor.x - tooltip.width - gap;
            break;
        case 'right':
            top = anchor.y + anchor.height / 2 - tooltip.height / 2;
            left = anchor.x + anchor.width + gap;
            break;
    }

    // Clamp along the cross axis only: the main axis was settled by the flip.
    if (vertical) {
        left = clamp(left, margin, viewport.width - tooltip.width - margin);
    } else {
        top = clamp(top, margin, viewport.height - tooltip.height - margin);
    }

    const arrowOffset = vertical
        ? anchor.x + anchor.width / 2 - left
        : anchor.y + anchor.height / 2 - top;
    const size = vertical ? tooltip.width : tooltip.height;

    return {
        top,
        left,
        placement,
        arrowOffset: clamp(arrowOffset, arrowInset, size - arrowInset),
    };
}
