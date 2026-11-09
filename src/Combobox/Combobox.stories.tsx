import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { type SelectOption } from '../Select/SelectOption';
import { Combobox, type ComboboxProps } from './Combobox';

type City = string;

const cities: SelectOption<City>[] = [
    { value: 'sp', label: 'São Paulo' },
    { value: 'rj', label: 'Rio de Janeiro' },
    { value: 'bh', label: 'Belo Horizonte' },
    { value: 'bsb', label: 'Brasília' },
    { value: 'ssa', label: 'Salvador' },
    { value: 'for', label: 'Fortaleza' },
    { value: 'cwb', label: 'Curitiba' },
    { value: 'rec', label: 'Recife' },
    { value: 'poa', label: 'Porto Alegre' },
    { value: 'bel', label: 'Belém' },
    { value: 'gyn', label: 'Goiânia' },
    { value: 'man', label: 'Manaus' },
];

const meta = {
    title: 'Components/Combobox',
    component: Combobox,
    tags: ['autodocs'],
    args: { label: 'City', options: cities, placeholder: 'Search for a city' },
} satisfies Meta<ComboboxProps<City>>;
export default meta;

type Story = StoryObj<ComboboxProps<City>>;

/** Type to narrow the list. Accents and case do not matter: "sao" finds São Paulo. */
export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: 'rj' } };

export const WithHint: Story = {
    args: { hint: 'Where we deliver', placeholder: undefined },
};

export const Error: Story = {
    args: { error: 'Choose a city from the list', placeholder: undefined },
};

/** Disabled options are skipped by the keyboard and cannot be picked. */
export const DisabledOption: Story = {
    args: {
        options: cities.map((city) =>
            city.value === 'bsb' ? { ...city, disabled: true } : city,
        ),
    },
};

export const Disabled: Story = {
    args: { defaultValue: 'sp', disabled: true },
};

/** The parent owns the value. */
export const Controlled: Story = {
    // Storybook needs a valid set of args; the render below supplies the real controlled props.
    args: { defaultValue: 'sp' },
    render: () => {
        const [value, setValue] = useState<City | null>('sp');
        return (
            <div style={{ display: 'grid', gap: 12 }}>
                <Combobox
                    label="City"
                    options={cities}
                    value={value}
                    onValueChange={setValue}
                />
                <span
                    style={{
                        font: 'var(--tintora-font-caption)',
                        color: 'var(--tintora-text-muted)',
                    }}
                >
                    value: {value ?? 'none'}
                </span>
            </div>
        );
    },
};

/** `name` adds a hidden input, so the value (not the label) is in the form data. */
export const InForm: Story = {
    args: { name: 'city', defaultValue: 'bh' },
};

/** The text for an empty search is a prop, so it can be translated. */
export const Translated: Story = {
    args: {
        label: 'Cidade',
        placeholder: 'Procure uma cidade',
        emptyLabel: 'Nenhum resultado',
    },
};
