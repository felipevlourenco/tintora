/**
 * The index of the label a typed buffer points at, or -1. `current` is the
 * item that has focus now (-1 for none). One letter, or the same letter again
 * and again, steps through the labels that start with it; a longer buffer
 * narrows the match and stays on the current item while it still fits.
 */
export function findTypeaheadMatch(
    labels: readonly string[],
    buffer: string,
    current: number,
): number {
    if (!buffer || labels.length === 0) return -1;
    const text = buffer.toLowerCase();
    const cycling = [...text].every((char) => char === text[0]);
    const search = cycling ? text[0] : text;
    const start = cycling ? current + 1 : Math.max(current, 0);
    for (let i = 0; i < labels.length; i++) {
        const index = (start + i) % labels.length;
        if (labels[index].toLowerCase().startsWith(search)) return index;
    }
    return -1;
}
