import { createContext, useContext } from 'react';

interface TabsContextValue {
    /** The selected tab's value. */
    value: string;
    select: (value: string) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext() {
    const context = useContext(TabsContext);

    if (!context) {
        throw new Error('Tab must be rendered inside Tabs');
    }

    return context;
}
