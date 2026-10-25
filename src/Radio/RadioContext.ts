'use client';

import { createContext, useContext } from 'react';

interface RadioContextValue {
    /** Shared by every radio in the group, so the browser treats them as one. */
    name: string;
    /** The selected radio's value, or `null` when nothing is selected. */
    value: string | null;
    select: (value: string) => void;
    disabled: boolean;
}

export const RadioContext = createContext<RadioContextValue | null>(null);

export function useRadioContext() {
    const context = useContext(RadioContext);

    if (!context) {
        throw new Error('Radio must be rendered inside a RadioGroup');
    }

    return context;
}
