/**
 * The `*` after a field's label. Hidden from assistive tech, which already
 * hears "required" from the input itself. Internal: not exported from the
 * package.
 */
export function RequiredMark({ show }: { show?: boolean }) {
    return show ? (
        <span className="tintora-textfield__required" aria-hidden="true">
            *
        </span>
    ) : null;
}
