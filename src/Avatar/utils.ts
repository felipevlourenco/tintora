export function getCapitalFirstLetters(name: string): string {
    if (!name.length) {
        return '';
    }

    const parts = name
        .trim()
        .split(/\s+/)
        .map((part) => part.match(/\p{L}\p{M}*/u)?.[0])
        .filter((part): part is string => Boolean(part));

    const firstName = parts[0] ?? '';
    const lastName = parts.length > 1 ? (parts.at(-1) ?? '') : '';

    return `${firstName}${lastName}`.toLocaleUpperCase();
}
