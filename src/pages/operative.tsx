import useSWR, { useSWRConfig } from 'swr';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { apiPatch } from '@lib/api';
import { success, error } from '@lib/notification';

import { Contract, FetchResult } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Divider, Modal, NumberInput, SimpleGrid, Table, Title } from '@mantine/core';

import { CheckIcon, PencilAltIcon } from '@heroicons/react/outline';
import { useState } from 'react';

const Operative: React.FC = () => {
    const { id } = useParams();

    const url = `/items/contracts/${id}`;
    const queryFields = { fields: ['*', 'processings.*', 'processings.process_definition.*', 'press.*', 'press.paper.*', 'press.run_type.*', 'press.varnish.*'] };
    const key = [url, queryFields];

    const { data: contract } = useSWR<FetchResult<Contract>>(key);

    const saveProcessing = async (id: number) => {
        const setup_hours = (document.getElementById(`processing_setup_hours_${id}`) as HTMLInputElement)?.value;
        const working_hours = (document.getElementById(`processing_working_hours_${id}`) as HTMLInputElement).value;
        const actual_quantity = (document.getElementById(`processing_actual_quantity_${id}`) as HTMLInputElement).value;

        if (setup_hours || working_hours || actual_quantity) {
            const processing = contract?.data.processings?.find(p => p.id === id);
            if (processing) {
                processing.setup_hours = setup_hours && +setup_hours > 0 ? +setup_hours : undefined;
                processing.working_hours = working_hours && +working_hours > 0 ? +working_hours : undefined;
                processing.actual_quantity = actual_quantity && +actual_quantity > 0 ? +actual_quantity : undefined;

                await saveContract();
            }
        }
    };

    const { mutate } = useSWRConfig();
    const saveContract = async () => {
        try {
            await mutate(key, apiPatch(url, contract?.data));
            success('Commessa salvata con successo');
        } catch (e) {
            error(e);
        }
    };

    const [opened, setOpened] = useState(false);

    return contract ? (
        <Layout title="Campi della Commessa">
            <Title order={1} mt="xl">
                Commessa n° {contract.data.number} del {dayjs(contract.data.date).format('DD/MM/YYYY')}
            </Title>

            <Modal opened={opened} onClose={() => setOpened(false)} title="Introduce yourself!">
                ciaone
            </Modal>

            <Title order={2} mt="xl">
                {contract.data.title}
            </Title>
            {contract.data.description && <>{contract.data.description}</>}
            <SimpleGrid cols={4} mt="xl">
                <div>
                    <b>Cliente</b>: {contract.data.customer}
                </div>

                {contract.data.desired_delivery && (
                    <div>
                        <b>Data di consegna</b>: {dayjs(contract.data.desired_delivery).format('DD/MM/YYYY')}
                    </div>
                )}

                {contract.data.estimate && (
                    <div>
                        <b>Preventivo</b>: {contract.data.estimate} del {dayjs(contract.data.estimate_date).format('DD/MM/YYYY')}
                    </div>
                )}

                <div>
                    <b>Agente</b>: {contract.data.representative}
                </div>
            </SimpleGrid>

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             * Lavorazioni di grafica e prestampa
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract.data.processings && contract.data.processings.filter(p => p.process_definition?.pre).length > 0 && (
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
                                <th className="w-40 px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract.data.processings
                                ?.filter(p => p.process_definition?.pre)
                                ?.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2 font-bold">{p.process_definition?.name}</td>
                                        <td className="px-4 py-2">{p.name}</td>
                                        <td className="px-4 py-2">{p.estimate_hours}</td>
                                        <td className="px-4 py-2">
                                            <NumberInput id={`processing_working_hours_${p.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={p.working_hours} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="ml-4 flex self-center">
                                                <ActionIcon variant="outline" color="green" size="xl" onClick={() => saveProcessing(p.id as number)}>
                                                    <CheckIcon />
                                                </ActionIcon>

                                                <ActionIcon variant="outline" color="primary" size="xl" className="ml-4" onClick={() => saveProcessing(p.id as number)}>
                                                    <PencilAltIcon />
                                                </ActionIcon>
                                            </div>
                                        </td>
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
            {contract.data.press && contract.data.press.filter(p => p.run_type?.kind === 'offset').length > 0 && (
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
                            </tr>
                        </thead>
                        <tbody>
                            {contract.data.press
                                .filter(p => p.run_type?.kind === 'offset')
                                .map(op => (
                                    <tr key={op.id}>
                                        <td className="px-4 py-2 font-bold">{op.run_type?.name}</td>
                                        <td className="px-4 py-2">{op.colors.map(c => c.toUpperCase())}</td>
                                        <td className="px-4 py-2">{op.pantones?.map(pa => pa.name).join(', ')}</td>
                                        <td className="px-4 py-2">{op.varnish?.name}</td>
                                        <td className="px-4 py-2">{op.yield}</td>
                                        <td className="px-4 py-2">{op.run_type?.name !== 'Volta' ? Math.ceil(contract.data.quantity / op.yield) : '-'}</td>
                                        <td className="px-4 py-2">{op.paper.name}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>

                    <Title order={3} mt="xl">
                        Lastre:&nbsp;
                        {contract.data.press.filter(p => p.run_type?.kind === 'offset').flatMap(op => op.colors).length +
                            contract.data.press.filter(p => p.run_type?.kind === 'offset').flatMap(op => op.pantones).length +
                            contract.data.press
                                .filter(p => p.run_type?.kind === 'offset')
                                .flatMap(op => op.varnish)
                                .filter(v => v?.add_plate).length}
                        &nbsp;- Fogli:&nbsp;
                        {contract.data.press
                            .filter(p => p.run_type?.kind === 'offset')
                            .filter(op => op.run_type?.name !== 'Volta')
                            .reduce((acc, curr) => acc + Math.ceil(contract.data.quantity / curr.yield), 0)}
                    </Title>
                </>
            )}

            {/**
             * --------------------------------------------------------------------------------------------------------------------------
             * Avviamenti digitale
             * --------------------------------------------------------------------------------------------------------------------------
             */}
            {contract.data.press && contract.data.press.filter(p => p.run_type?.kind === 'digital').length > 0 && (
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
                            {contract.data.press
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
            {contract.data.processings && contract.data.processings.filter(p => !p.process_definition?.pre).length > 0 && (
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
                                <th className="w-24 px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract.data.processings
                                .filter(p => !p.process_definition?.pre)
                                .map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2 font-bold">{p.process_definition?.name}</td>
                                        <td className="px-4 py-2">{p.name}</td>
                                        <td className="px-4 py-2">{p.estimate_hours}</td>
                                        <td className="px-4 py-2">
                                            <NumberInput id={`processing_setup_hours_${p.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={p.setup_hours} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <NumberInput id={`processing_working_hours_${p.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={p.working_hours} />
                                        </td>
                                        <td className="px-4 py-2">{p.expected_quantity ?? '-'}</td>
                                        <td className="px-4 py-2">
                                            <NumberInput id={`processing_actual_quantity_${p.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={p.actual_quantity} />
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="ml-4 flex self-center">
                                                <ActionIcon variant="outline" color="green" size="xl" onClick={() => saveProcessing(p.id as number)}>
                                                    <CheckIcon />
                                                </ActionIcon>

                                                <ActionIcon variant="outline" color="primary" size="xl" className="ml-4" onClick={() => saveProcessing(p.id as number)}>
                                                    <PencilAltIcon />
                                                </ActionIcon>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </>
            )}
        </Layout>
    ) : (
        <>La commessa è vuota</>
    );
};

export default Operative;
