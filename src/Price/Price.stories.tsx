import type { Meta, StoryObj } from '@storybook/react-vite';
import { Price } from './Price';

const meta = {
    title: 'Components/Price',
    component: Price,
    tags: ['autodocs'],
    args: { value: 54 },
    argTypes: { value: { control: { type: 'number', min: 0, step: 0.5 } } },
} satisfies Meta<typeof Price>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The original price is struck through, and read out as "Original price". */
export const OnSale: Story = { args: { compareAt: 62 } };

export const OtherCurrency: Story = {
    args: { value: 54, compareAt: 62, currency: 'EUR', locale: 'de-DE' },
};

/** The size follows the text around it. */
export const Large: Story = {
    args: { compareAt: 62 },
    render: (args) => (
        <div style={{ fontSize: 28 }}>
            <Price {...args} />
        </div>
    ),
};
