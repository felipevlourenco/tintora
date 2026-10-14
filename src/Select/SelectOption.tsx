import clsx from 'clsx';
import './Select.css';
import { useSelectContext } from './SelectContext';

export interface SelectOption<T extends string = string> {
    value: T;
    label: string;
    disabled?: boolean;
}

export function SelectOption({ label, value, disabled }: SelectOption) {
    const { select, value: selectedValue } = useSelectContext();

    const onClickHandler = () => {
        select(value);
    };

    return (
        <button
            role="option"
            disabled={disabled}
            className={clsx('tintora-select__option')}
            aria-selected={selectedValue === value}
            onClick={onClickHandler}
        >
            {label}
        </button>
    );
}
