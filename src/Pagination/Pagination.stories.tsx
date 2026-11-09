import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Pagination } from './Pagination';

const meta = {
    title: 'Components/Pagination',
    component: Pagination,
    tags: ['autodocs'],
    args: { page: 1, pageCount: 20 },
} satisfies Meta<typeof Pagination>;
export default meta;

type Story = StoryObj<typeof meta>;

function Demo({
    pageCount,
    siblingCount,
}: {
    pageCount: number;
    siblingCount?: number;
}) {
    const [page, setPage] = useState(1);
    return (
        <Pagination
            page={page}
            pageCount={pageCount}
            siblingCount={siblingCount}
            onPageChange={setPage}
        />
    );
}

/** Buttons that call `onPageChange`. The current page is the accent pill. */
export const Default: Story = {
    render: (args) => (
        <Demo pageCount={args.pageCount} siblingCount={args.siblingCount} />
    ),
};

export const FewPages: Story = { render: () => <Demo pageCount={5} /> };

export const MoreSiblings: Story = {
    render: () => <Demo pageCount={40} siblingCount={2} />,
};

/** With `getHref` the pages are links, for a list whose page is in the URL. */
export const AsLinks: Story = {
    args: { page: 4, getHref: (page: number) => `#page-${page}` },
};

export const MiddlePage: Story = { args: { page: 10 } };
