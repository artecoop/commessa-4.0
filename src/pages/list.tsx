import { Link } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

import { Contract, FetchResult } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Anchor, Group, Table, Title } from '@mantine/core';

import { EyeIcon, PencilIcon, PlusIcon, PrinterIcon } from '@heroicons/react/outline';

const Commesse: React.FC = () => {
    const { data: contracts } = useSWR<FetchResult<Contract[]>>(['/items/contracts', { fields: ['id', 'title', 'date', 'customer', 'desired_delivery'] }]);

    return (
        <Layout title="Commesse">
            <Group>
                <Title order={1}>Commesse</Title>

                <ActionIcon color="primary" variant="filled" component={Link} to="/commesse/manage">
                    <PlusIcon />
                </ActionIcon>
            </Group>

            <Table striped fontSize="lg" mt="xl">
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
                                <Anchor component={Link} to={`manage/${c.id}`} size="lg">
                                    <b>{c.title}</b>
                                </Anchor>
                            </td>
                            <td>{dayjs(c.date).format('DD/MM/YYYY')}</td>
                            <td>{c.customer}</td>
                            <td>{c.desired_delivery ? dayjs(c.desired_delivery).format('DD/MM/YYYY') : '-'}</td>
                            <td>
                                <Group spacing="xs">
                                    <ActionIcon color="primary" size="lg" component={Link} to={`manage/${c.id}`}>
                                        <PencilIcon />
                                    </ActionIcon>
                                    <ActionIcon size="lg" color="blue" component={Link} to={`/operative/${c.id}`}>
                                        <EyeIcon />
                                    </ActionIcon>
                                    <ActionIcon size="lg" color="red" onClick={() => window.open(`/print/${c.id}`, 'printWindow', 'popup')}>
                                        <PrinterIcon />
                                    </ActionIcon>
                                </Group>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Layout>
    );
};

export default Commesse;
