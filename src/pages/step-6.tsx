import dayjs from 'dayjs';

import { Contract } from 'types';
import { processings, offsetRunTypes, digitalRunTypes, varnishTypes } from 'values';

import { SimpleGrid, Table, Title } from '@mantine/core';

type Props = {
    contract?: Contract;
};

const Step6: React.FC<Props> = ({ contract }: Props) => {
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

            {contract && contract.processings && contract?.processings?.filter(p => ['design', 'prepress'].includes(p.kind)).length > 0 && (
                <>
                    <Title order={3} mt="xl">
                        Lavorazioni di grafica e prestampa
                    </Title>

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
                            {contract?.processings
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

            {contract?.offset_prints && (
                <>
                    <Title order={3} mt="xl">
                        Avviamenti offset
                    </Title>

                    <Table striped mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Colori</th>
                                <th className="px-4 py-2">Pantoni</th>
                                <th className="px-4 py-2">Verniciatura</th>
                                <th className="px-4 py-2">Resa</th>
                                <th className="px-4 py-2">Carta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.offset_prints?.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-2 font-bold">{offsetRunTypes.find(pr => pr.value === p.run_type)?.label}</td>
                                    <td className="px-4 py-2">{p.colors?.join('')}</td>
                                    <td className="px-4 py-2">{p.pantones?.map(pa => pa.name).join(', ')}</td>
                                    <td className="px-4 py-2">{varnishTypes.find(pr => pr.value === p.varnish)?.label}</td>
                                    <td className="px-4 py-2">{p.yield}</td>
                                    <td className="px-4 py-2">{p.paper}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            {contract?.digital_prints && (
                <>
                    <Title order={3} mt="xl">
                        Avviamenti digitali
                    </Title>

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
                            {contract?.digital_prints?.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-2 font-bold">{digitalRunTypes.find(pr => pr.value === p.kind)?.label}</td>
                                    <td className="px-4 py-2">{p.description}</td>
                                    <td className="px-4 py-2">{p.color ? 'Colori' : 'B/N'}</td>
                                    <td className="px-4 py-2">{p.sheets}</td>
                                    <td className="px-4 py-2">{p.paper}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            {contract && contract.processings && contract?.processings?.filter(p => !['design', 'prepress'].includes(p.kind)).length > 0 && (
                <>
                    <Title order={3} mt="xl">
                        Lavorazioni post stampa
                    </Title>

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
                            {contract?.processings
                                ?.filter(p => !['design', 'prepress'].includes(p.kind))
                                ?.map(p => (
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
