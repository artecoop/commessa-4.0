import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { Contract, FetchResult } from 'types';

import { Divider, SimpleGrid, Table, Title } from '@mantine/core';

const Print: React.FC = () => {
    const { id } = useParams();

    const url = `/items/contracts/${id}`;
    const queryFields = { fields: ['*', 'processings.*', 'processings.process_definition.*', 'processings.notes.*', 'press.*', 'press.paper.*', 'press.run_type.*', 'press.varnish.*'] };
    const key = [url, queryFields];

    const { data: contract } = useSWR<FetchResult<Contract>>(key);

    return (
        <div>
            <Title order={1} mt="xl">
                Commessa n° {contract?.data.number} del {dayjs(contract?.data.date).format('DD/MM/YYYY')}
            </Title>

            <Title order={2} mt="xl">
                {contract?.data.title}
            </Title>
            {contract?.data.description && <>{contract?.data.description}</>}
            <SimpleGrid cols={4} mt="xl">
                <div>
                    <b>Cliente</b>: {contract?.data.customer}
                </div>

                {contract?.data.desired_delivery && (
                    <div>
                        <b>Data di consegna</b>: {dayjs(contract?.data.desired_delivery).format('DD/MM/YYYY')}
                    </div>
                )}

                {contract?.data.estimate && (
                    <div>
                        <b>Preventivo</b>: {contract?.data.estimate} del {dayjs(contract?.data.estimate_date).format('DD/MM/YYYY')}
                    </div>
                )}

                <div>
                    <b>Agente</b>: {contract?.data.representative}
                </div>
            </SimpleGrid>

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             * Lavorazioni di grafica e prestampa
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract?.data.processings && contract?.data.processings.filter(p => p.process_definition?.pre).length > 0 && (
                <>
                    <Divider my="xl" size="xl" color="blue" />

                    <Title order={3}>Lavorazioni di grafica e prestampa</Title>

                    <Table striped fontSize="lg" mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Nome</th>
                                <th className="w-48 px-4 py-2">Ore preventivate</th>
                                <th className="w-48 px-4 py-2">Ore lavorate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.data.processings
                                ?.filter(p => p.process_definition?.pre)
                                ?.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2 font-bold">{p.process_definition?.name}</td>
                                        <td className="px-4 py-2">{p.name}</td>
                                        <td className="px-4 py-2">{p.estimate_hours}</td>
                                        <td className="px-4 py-2">{p.working_hours}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </>
            )}

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             * Avviamenti offset
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract?.data.press && contract?.data.press.filter(p => p.run_type?.kind === 'offset').length > 0 && (
                <>
                    <Divider my="xl" size="xl" color="blue" />

                    <Title order={3}>Avviamenti offset</Title>

                    <Table striped fontSize="lg" mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Colori</th>
                                <th className="px-4 py-2">Pantoni</th>
                                <th className="px-4 py-2">Verniciatura</th>
                                <th className="px-4 py-2">Resa</th>
                                <th className="px-4 py-2">Fogli</th>
                                <th className="px-4 py-2">Carta</th>
                                <th className="w-48 px-4 py-2">Ore lavorate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.data.press
                                .filter(p => p.run_type?.kind === 'offset')
                                .map(op => (
                                    <tr key={op.id}>
                                        <td className="px-4 py-2 font-bold">{op.run_type?.name}</td>
                                        <td className="px-4 py-2">{op.colors.map(c => c.toUpperCase())}</td>
                                        <td className="px-4 py-2">{op.pantones?.map(pa => pa.name).join(', ')}</td>
                                        <td className="px-4 py-2">{op.varnish?.name}</td>
                                        <td className="px-4 py-2">{op.yield}</td>
                                        <td className="px-4 py-2">{op.run_type?.name !== 'Volta' ? Math.ceil(contract?.data.quantity / op.yield) : '-'}</td>
                                        <td className="px-4 py-2">
                                            {op.paper.name} {op.paper.weight}gr {op.paper.format} {op.paper.orientation}
                                        </td>
                                        <td className="px-4 py-2">{op.working_hours}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>

                    <Title order={3} mt="xl">
                        Lastre:&nbsp;
                        {contract?.data.press.filter(p => p.run_type?.kind === 'offset').flatMap(op => op.colors).length +
                            contract?.data.press.filter(p => p.run_type?.kind === 'offset').flatMap(op => op.pantones).length +
                            contract?.data.press
                                .filter(p => p.run_type?.kind === 'offset')
                                .flatMap(op => op.varnish)
                                .filter(v => v?.add_plate).length}
                        &nbsp;- Fogli:&nbsp;
                        {contract?.data.press
                            .filter(p => p.run_type?.kind === 'offset')
                            .filter(op => op.run_type?.name !== 'Volta')
                            .reduce((acc, curr) => acc + Math.ceil(contract?.data.quantity / curr.yield), 0)}
                    </Title>
                </>
            )}

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             * Avviamenti digitale
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract?.data.press && contract?.data.press.filter(p => p.run_type?.kind === 'digital').length > 0 && (
                <>
                    <Divider my="xl" size="xl" color="blue" />

                    <Title order={3}>Avviamenti digitali</Title>

                    <Table striped fontSize="lg" mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Descrizione</th>
                                <th className="px-4 py-2">Colori</th>
                                <th className="px-4 py-2">Resa</th>
                                <th className="px-4 py-2">Fogli</th>
                                <th className="px-4 py-2">Carta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.data.press
                                .filter(p => p.run_type?.kind === 'digital')
                                .map(dp => (
                                    <tr key={dp.id}>
                                        <td className="px-4 py-2 font-bold">{dp.run_type?.name}</td>
                                        <td className="px-4 py-2">{dp.description}</td>
                                        <td className="px-4 py-2">{dp.colors.length > 1 ? 'Colori' : 'B/N'}</td>
                                        <td className="px-4 py-2">{dp.yield}</td>
                                        <td className="px-4 py-2">{dp.sheets}</td>
                                        <td className="px-4 py-2">{dp.paper.name}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </>
            )}

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             * Lavorazioni post stampa
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract?.data.processings && contract?.data.processings.filter(p => !p.process_definition?.pre).length > 0 && (
                <>
                    <Divider my="xl" size="xl" color="blue" />

                    <Title order={3}>Lavorazioni post stampa</Title>

                    <Table striped fontSize="lg" mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Descrizione</th>
                                <th className="w-48 px-4 py-2">Ore preventivate</th>
                                <th className="w-48 px-4 py-2">Ore setup</th>
                                <th className="w-48 px-4 py-2">Ore lavorazione</th>
                                <th className="w-48 px-4 py-2">Quantità</th>
                                <th className="w-48 px-4 py-2">Quantità effettiva</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.data.processings
                                .filter(p => !p.process_definition?.pre)
                                .map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2 font-bold">{p.process_definition?.name}</td>
                                        <td className="px-4 py-2">{p.name}</td>
                                        <td className="px-4 py-2">{p.estimate_hours}</td>
                                        <td className="px-4 py-2">{p.setup_hours}</td>
                                        <td className="px-4 py-2">{p.working_hours}</td>
                                        <td className="px-4 py-2">{p.expected_quantity ?? '-'}</td>
                                        <td className="px-4 py-2">{p.actual_quantity}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </>
            )}
        </div>
    );
};

export default Print;
