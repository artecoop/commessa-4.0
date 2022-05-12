import { Link } from 'react-router-dom';
import useSWR from 'swr';
import dayjs from 'dayjs';

import { Contract, FetchResult } from 'types';

import Layout from '@components/_layout';
import { ActionIcon, Title } from '@mantine/core';
import { PencilIcon, PlusIcon } from '@heroicons/react/outline';

const Commesse: React.FC = () => {
    const { data: contracts } = useSWR<FetchResult<Contract[]>>('/items/contracts');

    return (
        <Layout title="Commesse">
            <div className="flex items-center">
                <Title order={1}>Commesse</Title>

                <ActionIcon variant="outline" color="green" component={Link} to="/commesse/manage" className="ml-4">
                    <PlusIcon />
                </ActionIcon>
            </div>

            <table className="mt-8 w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-left">Titolo</th>
                        <th className="px-4 py-2 text-left">Data</th>
                        <th className="px-4 py-2 text-left">Cliente</th>
                        <th className="px-4 py-2 text-left">Consegna</th>
                        <th className="w-32" />
                    </tr>
                </thead>
                <tbody>
                    {contracts?.data.map(c => (
                        <tr key={c.id} className="bg-slate-100 even:bg-slate-200">
                            <td className="px-4 py-2 text-left">{c.title}</td>
                            <td className="px-4 py-2 text-left">{dayjs(c.date).format('DD/MM/YYYY')}</td>
                            <td className="px-4 py-2 text-left">{c.customer}</td>
                            <td className="px-4 py-2 text-left">{c.desired_delivery ? dayjs(c.date).format('DD/MM/YYYY') : '-'}</td>
                            <td>
                                <ActionIcon color="primary" size="lg" component={Link} to={`manage/${c.id}`}>
                                    <PencilIcon />
                                </ActionIcon>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    );
};

export default Commesse;
