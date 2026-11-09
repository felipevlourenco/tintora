'use client';

import { createContext, useContext } from 'react';

interface MenuContextValue {
    /** Closes the menu and returns focus to its trigger. */
    close: () => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function useMenuContext() {
    const context = useContext(MenuContext);

    if (!context) {
        throw new Error('MenuItem must be rendered inside a Menu');
    }

    return context;
}
