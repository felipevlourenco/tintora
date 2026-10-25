'use client';

import { createContext, useContext } from 'react';

interface SelectContextValue {
    /** The selected value, or null when nothing is selected. */
    value: string | null;
    /** The option the keyboard or pointer is on (aria-activedescendant). */
    activeValue: string | null;
    select: (value: string) => void;
    activate: (value: string) => void;
    optionId: (value: string) => string;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export const useSelectContext = () => {
    const context = useContext(SelectContext);

    if (!context) {
        throw new Error('SelectOption must be rendered inside a Select');
    }

    return context;
};
