import dayjs from 'dayjs';

import { Contract, FetchResult, Paper } from 'types';
import { processings, offsetRunTypes, digitalRunTypes, varnishTypes } from 'values';

import { Divider, SimpleGrid, Table, Title } from '@mantine/core';
import useSWR from 'swr';

type Props = {
    contract: Contract;
};

const Step6: React.FC<Props> = ({ contract }: Props) => {
    const { data: papers } = useSWR<FetchResult<Paper[]>>(['/items/paper', { sort: ['name'] }]);

    return contract ? (
        <>
            <Title order={1} mt="xl">
                Commessa n° {contract.number} del {dayjs(contract.date).format('DD/MM/YYYY')}
            </Title>

            <Title order={2} mt="xl">
                {contract.title}
            </Title>
            {contract.description && <>{contract.description}</>}
            <SimpleGrid cols={4} mt="xl">
                <div>
                    <b>Cliente</b>: {contract.customer}
                </div>

                {contract.desired_delivery && (
                    <div>
                        <b>Data di consegna</b>: {dayjs(contract.desired_delivery).format('DD/MM/YYYY')}
                    </div>
                )}

                {contract.estimate && (
                    <div>
                        <b>Preventivo</b>: {contract.estimate} del {dayjs(contract.estimate_date).format('DD/MM/YYYY')}
                    </div>
                )}

                <div>
                    <b>Agente</b>: {contract.representative}
                </div>
            </SimpleGrid>

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             *  Lavorazioni di grafica e prestampa
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract.processings && contract.processings.filter(p => ['design', 'prepress'].includes(p.kind)).length > 0 && (
                <>
                    <Divider my="xl" size="xl" color="blue" />

                    <Title order={3}>Lavorazioni di grafica e prestampa</Title>

                    <Table striped mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Ore preventivate</th>
                                <th className="px-4 py-2">Ore lavorate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.processings
                                ?.filter(p => ['design', 'prepress'].includes(p.kind))
                                ?.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2 font-bold">{processings.find(pr => pr.value === p.kind)?.label}</td>
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
             *  Avviamenti offset
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract.offset_prints && (
                <>
                    <Divider my="xl" size="xl" color="blue" />

                    <Title order={3}>Avviamenti offset</Title>

                    <Table striped mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Colori</th>
                                <th className="px-4 py-2">Pantoni</th>
                                <th className="px-4 py-2">Verniciatura</th>
                                <th className="px-4 py-2">Resa</th>
                                <th className="px-4 py-2">Fogli</th>
                                <th className="px-4 py-2">Carta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.offset_prints.map(op => (
                                <tr key={op.id}>
                                    <td className="px-4 py-2 font-bold">{offsetRunTypes.find(pr => pr.value === op.run_type)?.label}</td>
                                    <td className="px-4 py-2">{op.colors?.join('')}</td>
                                    <td className="px-4 py-2">{op.pantones?.map(pa => pa.name).join(', ')}</td>
                                    <td className="px-4 py-2">{varnishTypes.find(pr => pr.value === op.varnish)?.label}</td>
                                    <td className="px-4 py-2">{op.yield}</td>
                                    <td className="px-4 py-2">{op.run_type !== 'v' ? Math.ceil(contract.quantity / op.yield) : '-'}</td>
                                    <td className="px-4 py-2">{papers?.data.find(d => d.id === op.paper)?.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Title order={3} mt="xl">
                        Lastre:&nbsp;
                        {contract.offset_prints.flatMap(op => op.colors).length +
                            contract.offset_prints.flatMap(op => op.pantones).length +
                            contract.offset_prints.flatMap(op => op.varnish).filter(v => v === 'reserve').length}
                        &nbsp;- Fogli:&nbsp;{contract.offset_prints.filter(op => op.run_type !== 'v').reduce((acc, curr) => acc + Math.ceil(contract.quantity / curr.yield), 0)}
                    </Title>
                </>
            )}

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             *  Avviamenti digitale
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract.digital_prints && (
                <>
                    <Divider my="xl" size="xl" color="blue" />

                    <Title order={3}>Avviamenti digitali</Title>

                    <Table striped mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Descrizione</th>
                                <th className="px-4 py-2">Colori</th>
                                <th className="px-4 py-2">Fogli</th>
                                <th className="px-4 py-2">Carta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.digital_prints.map(dp => (
                                <tr key={dp.id}>
                                    <td className="px-4 py-2 font-bold">{digitalRunTypes.find(pr => pr.value === dp.kind)?.label}</td>
                                    <td className="px-4 py-2">{dp.description}</td>
                                    <td className="px-4 py-2">{dp.color ? 'Colori' : 'B/N'}</td>
                                    <td className="px-4 py-2">{dp.sheets}</td>
                                    <td className="px-4 py-2">{papers?.data.find(d => d.id === dp.paper)?.name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             *  Lavorazioni post stampa
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract.processings && contract.processings.filter(p => !['design', 'prepress'].includes(p.kind)).length > 0 && (
                <>
                    <Divider my="xl" size="xl" color="blue" />

                    <Title order={3}>Lavorazioni post stampa</Title>

                    <Table striped mt="xl">
                        <thead>
                            <tr>
                                <th className="w-32 px-4 py-2">Tipo</th>
                                <th className="w-32 px-4 py-2">Ore setup</th>
                                <th className="w-48 px-4 py-2">Ore preventivate</th>
                                <th className="w-32 px-4 py-2">Ore lavorate</th>
                                <th className="px-4 py-2">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract.processings
                                .filter(p => !['design', 'prepress'].includes(p.kind))
                                .map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2 font-bold">{processings.find(pr => pr.value === p.kind)?.label}</td>
                                        <td className="px-4 py-2">{p.setup_hours}</td>
                                        <td className="px-4 py-2">{p.estimate_hours}</td>
                                        <td className="px-4 py-2">{p.working_hours}</td>
                                        <td className="px-4 py-2">{p.note}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </>
            )}
        </>
    ) : (
        <>La commessa è vuota</>
    );
};

export default Step6;
