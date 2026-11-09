import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem } from './Accordion';

const meta = {
    title: 'Components/Accordion',
    component: Accordion,
    tags: ['autodocs'],
    decorators: [
        (Story) => (
            <div style={{ width: 'min(480px, 100%)' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof Accordion>;
export default meta;

type Story = StoryObj<typeof meta>;

/** Native `<details>`: it works from the keyboard and without JavaScript. */
export const Default: Story = {
    render: (args) => (
        <Accordion {...args}>
            <AccordionItem title="Description">
                A solid alder wood lamp with an adjustable arm and a brass
                switch.
            </AccordionItem>
            <AccordionItem title="Shipping" defaultOpen>
                Ships within two working days. Free over $50.
            </AccordionItem>
            <AccordionItem title="Returns">
                Return it within 30 days for a full refund.
            </AccordionItem>
        </Accordion>
    ),
};

/** The same `name` keeps one item open at a time, where the browser supports it. */
export const OneOpenAtATime: Story = {
    render: (args) => (
        <Accordion {...args}>
            {['Materials', 'Care', 'Warranty'].map((title) => (
                <AccordionItem key={title} title={title} name="details">
                    About the {title.toLowerCase()} of this product.
                </AccordionItem>
            ))}
        </Accordion>
    ),
};
