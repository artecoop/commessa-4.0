import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

import { useAuth } from '@contexts/auth';

import { Contract, FetchResult } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Anchor, Box, Group, Pagination, ScrollArea, Table, TextInput, Title } from '@mantine/core';

import { EyeIcon, PencilIcon, PlusIcon, PrinterIcon, SearchIcon, XIcon } from '@heroicons/react/outline';

const Commesse: React.FC = () => {
    const user = useAuth();

    const limit = 25;
    const [page, setPage] = useState(1);

    const [searchBox, setSearchBox] = useState<string>('');
    const [search, setSearch] = useState<string>();

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchBox.length > 2) {
                setSearch(searchBox);
            } else {
                setSearch(undefined);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchBox]);

    const queryParams = {
        ields: ['id', 'title', 'date', 'customer', 'desired_delivery'],
        sort: ['-date_created'],
        limit,
        meta: 'total_count',
        page,
        search
    };

    const { data: contracts } = useSWR<FetchResult<Contract[]>>(['/items/contracts', queryParams]);

    return (
        <Layout title="Commesse">
            <Box sx={{ display: 'flex' }}>
                <Group>
                    <Title order={1}>COMMESSE</Title>

                    <ActionIcon color="primary" radius="xl" variant="filled" component={Link} to="/commesse/manage">
                        <PlusIcon />
                    </ActionIcon>
                </Group>

                <Box sx={{ flex: 1 }} />

                <TextInput
                    size="xl"
                    label="Cerca tra le commesse"
                    value={searchBox}
                    onChange={e => setSearchBox(e.target.value)}
                    icon={<SearchIcon className="icon-field-left" />}
                    rightSection={
                        <ActionIcon onClick={() => setSearchBox('')} mr="xl">
                            <XIcon />
                        </ActionIcon>
                    }
                />
            </Box>

            <ScrollArea>
                <Table striped fontSize="lg" mt="xl" style={{ minWidth: 1000 }}>
                    <thead>
                        <tr>
                            <th>Titolo</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Consegna</th>
                            <th className="action-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {contracts?.data.map(c => (
                            <tr key={c.id}>
                                <td>
                                    {user.isInRole?.(['Administrator', 'Editor']) ? (
                                        <Anchor component={Link} to={`manage/${c.id}`} size="lg">
                                            <b>{c.title}</b>
                                        </Anchor>
                                    ) : (
                                        <b>{c.title}</b>
                                    )}
                                </td>
                                <td>{dayjs(c.date).format('DD/MM/YYYY')}</td>
                                <td>{c.customer}</td>
                                <td>{c.desired_delivery ? dayjs(c.desired_delivery).format('DD/MM/YYYY') : '-'}</td>
                                <td>
                                    <Group spacing="xs">
                                        {user.isInRole?.(['Administrator', 'Editor']) && (
                                            <ActionIcon color="primary" size="lg" component={Link} to={`manage/${c.id}`}>
                                                <PencilIcon />
                                            </ActionIcon>
                                        )}

                                        <ActionIcon size="lg" color="blue" component={Link} to={`/operative/${c.id}`}>
                                            <EyeIcon />
                                        </ActionIcon>

                                        {user.isInRole?.(['Administrator', 'Editor']) && (
                                            <ActionIcon size="lg" color="red" component={Link} to={`/print/${c.id}`}>
                                                <PrinterIcon />
                                            </ActionIcon>
                                        )}
                                    </Group>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <Box mt="xl" sx={{ display: 'flex', justifyContent: 'end' }}>
                    <Pagination page={page} onChange={setPage} total={Math.ceil((contracts?.meta?.total_count ?? 1) / limit)} />
                </Box>
            </ScrollArea>
        </Layout>
    );
};

export default Commesse;
