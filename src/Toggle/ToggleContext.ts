'use client';

import { createContext, useContext } from 'react';

interface ToggleContextValue {
    /** The selected item's value. */
    value: string;
    select: (value: string) => void;
    disabled: boolean;
}

export const ToggleContext = createContext<ToggleContextValue | null>(null);

export function useToggleContext() {
    const context = useContext(ToggleContext);

    if (!context) {
        throw new Error('ToggleItem must be rendered inside a Toggle');
    }

    return context;
}
