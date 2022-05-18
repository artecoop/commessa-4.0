import { Link } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

import { Contract, FetchResult } from 'types';

import Layout from '@components/_layout';
import { ActionIcon, Table, Title } from '@mantine/core';
import { PencilIcon, PlusIcon } from '@heroicons/react/outline';

const Commesse: React.FC = () => {
    const { data: contracts } = useSWR<FetchResult<Contract[]>>(['/items/contracts', { fields: ['id', 'title', 'date', 'customer', 'desired_delivery'] }]);

    return (
        <Layout title="Commesse">
            <div className="flex items-center">
                <Title order={1}>Commesse</Title>

                <ActionIcon variant="outline" color="green" component={Link} to="/commesse/manage" className="ml-4">
                    <PlusIcon />
                </ActionIcon>
            </div>

            <Table striped fontSize="lg" mt="xl">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Titolo</th>
                        <th className="px-4 py-2">Data</th>
                        <th className="px-4 py-2">Cliente</th>
                        <th className="px-4 py-2">Consegna</th>
                        <th className="w-32" />
                    </tr>
                </thead>
                <tbody>
                    {contracts?.data.map(c => (
                        <tr key={c.id}>
                            <td className="px-4 py-2">{c.title}</td>
                            <td className="px-4 py-2">{dayjs(c.date).format('DD/MM/YYYY')}</td>
                            <td className="px-4 py-2">{c.customer}</td>
                            <td className="px-4 py-2">{c.desired_delivery ? dayjs(c.date).format('DD/MM/YYYY') : '-'}</td>
                            <td>
                                <ActionIcon color="primary" size="lg" component={Link} to={`manage/${c.id}`}>
                                    <PencilIcon />
                                </ActionIcon>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Layout>
    );
};

export default Commesse;
