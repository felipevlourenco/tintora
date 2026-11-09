import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from '../Tag/Tag';
import { Table } from './Table';

const meta = {
    title: 'Components/Table',
    component: Table,
    tags: ['autodocs'],
    args: { caption: 'Recent orders', children: null },
    decorators: [
        (Story) => (
            <div style={{ width: 'min(640px, 100%)' }}>
                <Story />
            </div>
        ),
    ],
    // Without a render function, Storybook passes no children.
    render: (args) => (
        <Table {...args}>
            <thead>
                <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Status</th>
                    <th scope="col" data-align="end">
                        Total
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">#1042</th>
                    <td>Ana Souza</td>
                    <td>
                        <Tag variant="success" size="small">
                            Shipped
                        </Tag>
                    </td>
                    <td data-align="end">$54.00</td>
                </tr>
                <tr>
                    <th scope="row">#1041</th>
                    <td>Marcus Lee</td>
                    <td>
                        <Tag variant="accent" size="small">
                            Packing
                        </Tag>
                    </td>
                    <td data-align="end">$128.50</td>
                </tr>
                <tr>
                    <th scope="row">#1040</th>
                    <td>Ines Duarte</td>
                    <td>
                        <Tag size="small">Pending</Tag>
                    </td>
                    <td data-align="end">$12.00</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th scope="row" colSpan={3}>
                        Total
                    </th>
                    <td data-align="end">$194.50</td>
                </tr>
            </tfoot>
        </Table>
    ),
} satisfies Meta<typeof Table>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Compact: Story = { args: { density: 'compact' } };

/** The caption stays for screen readers but is not drawn. */
export const HiddenCaption: Story = { args: { captionHidden: true } };

/** Wider than its box: it scrolls sideways, and the region is focusable. */
export const Scrolling: Story = {
    args: { scrollLabel: 'Recent orders, scrollable' },
    decorators: [
        (Story) => (
            <div style={{ width: 320 }}>
                <Story />
            </div>
        ),
    ],
};
