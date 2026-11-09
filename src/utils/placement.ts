/** Where to put a popup (tooltip, popover) next to its trigger. */
export type Placement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Where the popup sits along the trigger's edge: lined up with its start (left,
 * or top for a popup on the left or right), its end, or centred.
 */
export type Alignment = 'start' | 'center' | 'end';

export interface PlacementOptions {
    /** Space between the anchor and the popup (an arrow sits inside it). */
    gap: number;
    /** Closest the popup may get to a viewport edge. */
    margin: number;
    /** Keeps the arrow clear of the popup's rounded corners. */
    arrowInset: number;
    /** @default 'center' */
    align: Alignment;
}

const DEFAULTS: PlacementOptions = {
    gap: 10,
    margin: 8,
    arrowInset: 12,
    align: 'center',
};

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

/** Where a popup of `size` starts along an anchor edge that starts at `start`. */
const along = (
    start: number,
    anchorSize: number,
    size: number,
    align: Alignment,
) =>
    align === 'start'
        ? start
        : align === 'end'
          ? start + anchorSize - size
          : start + anchorSize / 2 - size / 2;

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
    const { gap, margin, arrowInset, align } = opts;
    const placement = pickPlacement(anchor, tooltip, requested, viewport, opts);
    const vertical = placement === 'top' || placement === 'bottom';

    // The side settles one coordinate, the alignment the other.
    const alignedLeft = along(anchor.x, anchor.width, tooltip.width, align);
    const alignedTop = along(anchor.y, anchor.height, tooltip.height, align);
    let top: number;
    let left: number;
    switch (placement) {
        case 'top':
            top = anchor.y - tooltip.height - gap;
            left = alignedLeft;
            break;
        case 'bottom':
            top = anchor.y + anchor.height + gap;
            left = alignedLeft;
            break;
        case 'left':
            top = alignedTop;
            left = anchor.x - tooltip.width - gap;
            break;
        case 'right':
            top = alignedTop;
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

/**
 * Top edge for a dropdown under its trigger: below it, or above it when the
 * dropdown does not fit below but does fit above. When it fits neither way it
 * goes below, where the page can scroll to it.
 */
export function dropdownTop(
    anchor: Pick<DOMRect, 'top' | 'bottom'>,
    height: number,
    viewportHeight = window.innerHeight,
    gap = 4,
): number {
    const fitsBelow = anchor.bottom + gap + height <= viewportHeight;
    const fitsAbove = anchor.top - gap - height >= 0;
    return fitsBelow || !fitsAbove
        ? anchor.bottom + gap
        : anchor.top - gap - height;
}
