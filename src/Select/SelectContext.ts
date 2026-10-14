import { createContext, useContext } from 'react';

interface SelectContextValue {
    value: string;
    select: (value: string) => void;
}

export const SelectContenxt = createContext<SelectContextValue | null>(null);

export const useSelectContext = () => {
    const context = useContext(SelectContenxt);

    if (!context) {
        throw new Error('SelectOption must be rendered inside a Select');
    }

    return context;
};
