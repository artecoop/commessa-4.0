import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { apiPatch } from '@lib/api';
import { success, error } from '@lib/notification';

import { Contract, FetchResult, Press, Processing } from 'types';

import Layout from '@components/_layout';
import Notes from '@components/notes';

import { ActionIcon, Divider, Group, Modal, NumberInput, SimpleGrid, Table, Title } from '@mantine/core';

import { CheckIcon, PencilAltIcon } from '@heroicons/react/outline';

const Operative: React.FC = () => {
    const { id } = useParams();

    const url = `/items/contracts/${id}`;
    const queryFields = { fields: ['*', 'processings.*', 'processings.process_definition.*', 'processings.notes.*', 'press.*', 'press.paper.*', 'press.run_type.*', 'press.varnish.*'] };
    const key = [url, queryFields];

    const { data: contract } = useSWR<FetchResult<Contract>>(key);

    const saveProcessing = async (id: number) => {
        const setup_hours = (document.getElementById(`processing_setup_hours_${id}`) as HTMLInputElement)?.value;
        const working_hours = (document.getElementById(`processing_working_hours_${id}`) as HTMLInputElement).value;
        const actual_quantity = (document.getElementById(`processing_actual_quantity_${id}`) as HTMLInputElement).value;

        const processing = contract?.data.processings?.find(p => p.id === id);
        if (processing) {
            processing.setup_hours = setup_hours && +setup_hours > 0 ? +setup_hours : null;
            processing.working_hours = working_hours && +working_hours > 0 ? +working_hours : null;
            processing.actual_quantity = actual_quantity && +actual_quantity > 0 ? +actual_quantity : null;

            await saveContract();
        }
    };

    const savePress = async (id: number) => {
        const working_hours = (document.getElementById(`press_working_hours_${id}`) as HTMLInputElement).value;
        const consumed_sheets = (document.getElementById(`press_consumed_sheets_${id}`) as HTMLInputElement).value;

        console.log(working_hours, consumed_sheets);

        const press = contract?.data.press?.find(p => p.id === id);
        if (press) {
            press.working_hours = working_hours && +working_hours > 0 ? +working_hours : null;
            press.consumed_sheets = consumed_sheets && +consumed_sheets > 0 ? +consumed_sheets : null;

            await saveContract();
        }
    };

    const [currentNotesHolder, setCurrentNotesHolder] = useState<Processing | Press>();

    const saveNotes = async () => {
        await saveContract();

        setCurrentNotesHolder(undefined);
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

    return contract ? (
        <Layout title={`Commessa n° ${contract.data.number} del ${dayjs(contract.data.date).format('DD/MM/YYYY')}`}>
            <Title order={1} mt="xl">
                Commessa n° {contract.data.number} del {dayjs(contract.data.date).format('DD/MM/YYYY')}
            </Title>

            <Title order={2} mt="xl">
                {contract.data.title}
            </Title>
            {contract.data.description && <>{contract.data.description}</>}

            <SimpleGrid cols={5} mt="xl">
                <div>
                    <b>Qauntità</b>: {contract.data.quantity}
                </div>

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
                                <th>Tipo</th>
                                <th>Nome</th>
                                <th>Ore preventivate</th>
                                <th>Ore lavorate</th>
                                <th className="action-operative" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract.data.processings
                                ?.filter(p => p.process_definition?.pre)
                                ?.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <b>{p.process_definition?.name}</b>
                                        </td>
                                        <td>{p.name}</td>
                                        <td>{p.estimate_hours}</td>
                                        <td>
                                            <NumberInput id={`processing_working_hours_${p.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={p.working_hours ?? undefined} />
                                        </td>
                                        <td>
                                            <Group spacing="xs">
                                                <ActionIcon color="green" size="xl" onClick={() => saveProcessing(p.id as number)}>
                                                    <CheckIcon />
                                                </ActionIcon>

                                                <ActionIcon color="primary" size="xl" onClick={() => setCurrentNotesHolder(p)}>
                                                    <PencilAltIcon />
                                                </ActionIcon>
                                            </Group>
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
                                <th>Tipo</th>
                                <th>Descrizione</th>
                                <th>Colori</th>
                                <th>Pantoni</th>
                                <th>Verniciatura</th>
                                <th>Resa</th>
                                <th>Fogli</th>
                                <th>Carta</th>
                                <th>Ore lavorate</th>
                                <th>Fogli usati</th>
                                <th className="action-operative" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract.data.press
                                .filter(p => p.run_type?.kind === 'offset')
                                .map(op => (
                                    <tr key={op.id}>
                                        <td>
                                            <b>{op.run_type?.name}</b>
                                        </td>
                                        <td>
                                            <b>{op.description}</b>
                                        </td>
                                        <td>{op.colors?.map(c => c.toUpperCase())}</td>
                                        <td>{op.pantones?.map(pa => pa.name).join(', ')}</td>
                                        <td>{op.varnish?.name}</td>
                                        <td>{op.yield}</td>
                                        <td>{op.run_type?.name !== 'Volta' && op.colors && op.colors.length > 0 ? Math.ceil(contract.data.quantity / op.yield) : '-'}</td>
                                        <td>
                                            {op.paper.name} {op.paper.weight}gr {op.paper.format} {op.paper.orientation}
                                        </td>
                                        <td>
                                            <NumberInput id={`press_working_hours_${op.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={op.working_hours ?? undefined} />
                                        </td>
                                        <td>
                                            <NumberInput id={`press_consumed_sheets_${op.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={op.consumed_sheets ?? undefined} />
                                        </td>
                                        <td>
                                            <Group spacing="xs">
                                                <ActionIcon color="green" size="xl" onClick={() => savePress(op.id as number)}>
                                                    <CheckIcon />
                                                </ActionIcon>

                                                <ActionIcon color="primary" size="xl" onClick={() => setCurrentNotesHolder(op)}>
                                                    <PencilAltIcon />
                                                </ActionIcon>
                                            </Group>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>

                    <Title order={3} mt="xl">
                        Lastre:&nbsp;
                        {contract.data.press
                            .filter(p => p.run_type?.kind === 'offset')
                            .flatMap(op => op.colors)
                            .filter(op => op && op.length > 0).length +
                            contract.data.press
                                .filter(p => p.run_type?.kind === 'offset')
                                .flatMap(op => op.pantones)
                                .filter(op => op !== null).length +
                            contract.data.press
                                .filter(p => p.run_type?.kind === 'offset')
                                .flatMap(op => op.varnish)
                                .filter(v => v?.add_plate).length}
                        &nbsp;- Fogli:&nbsp;
                        {contract.data.press
                            .filter(p => p.run_type?.kind === 'offset')
                            .filter(op => op.run_type?.name !== 'Volta' && op.colors && op.colors.length > 0)
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
                                <th>Tipo</th>
                                <th>Descrizione</th>
                                <th>Colori</th>
                                <th>Resa</th>
                                <th>Fogli</th>
                                <th>Carta</th>
                                <th>Ore lavorate</th>
                                <th>Fogli usati</th>
                                <th className="action-operative" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract.data.press
                                .filter(p => p.run_type?.kind === 'digital')
                                .map(dp => (
                                    <tr key={dp.id}>
                                        <td>
                                            <b>{dp.run_type?.name}</b>
                                        </td>
                                        <td>{dp.description}</td>
                                        <td>{dp.colors && dp.colors.length > 1 ? 'Colori' : 'B/N'}</td>
                                        <td>{dp.yield}</td>
                                        <td>{dp.sheets}</td>
                                        <td>{dp.paper.name}</td>
                                        <td>
                                            <NumberInput id={`press_working_hours_${dp.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={dp.working_hours ?? undefined} />
                                        </td>
                                        <td>
                                            <NumberInput id={`press_consumed_sheets_${dp.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={dp.consumed_sheets ?? undefined} />
                                        </td>
                                        <td>
                                            <Group spacing="xs">
                                                <ActionIcon color="green" size="xl" onClick={() => savePress(dp.id as number)}>
                                                    <CheckIcon />
                                                </ActionIcon>

                                                <ActionIcon color="primary" size="xl" onClick={() => setCurrentNotesHolder(dp)}>
                                                    <PencilAltIcon />
                                                </ActionIcon>
                                            </Group>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>

                    <Title order={3} mt="xl">
                        Fogli:&nbsp;
                        {contract.data.press.filter(p => p.run_type?.kind === 'digital').reduce((acc, curr) => acc + (curr.sheets || 0), 0)}
                    </Title>
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
                                <th>Tipo</th>
                                <th>Descrizione</th>
                                <th>Ore preventivate</th>
                                <th>Ore setup</th>
                                <th>Ore lavorazione</th>
                                <th>Quantità</th>
                                <th>Quantità effettiva</th>
                                <th className="action-operative" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract.data.processings
                                .filter(p => !p.process_definition?.pre)
                                .map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            <b>{p.process_definition?.name}</b>
                                        </td>
                                        <td>{p.name}</td>
                                        <td>{p.estimate_hours}</td>
                                        <td>
                                            <NumberInput id={`processing_setup_hours_${p.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={p.setup_hours ?? undefined} />
                                        </td>
                                        <td>
                                            <NumberInput id={`processing_working_hours_${p.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={p.working_hours ?? undefined} />
                                        </td>
                                        <td>{p.expected_quantity ?? '-'}</td>
                                        <td>
                                            <NumberInput id={`processing_actual_quantity_${p.id}`} size="xl" variant="filled" min={0.5} step={0.5} defaultValue={p.actual_quantity ?? undefined} />
                                        </td>
                                        <td>
                                            <Group spacing="xs">
                                                <ActionIcon color="green" size="xl" onClick={() => saveProcessing(p.id as number)}>
                                                    <CheckIcon />
                                                </ActionIcon>

                                                <ActionIcon color="primary" size="xl" onClick={() => setCurrentNotesHolder(p)}>
                                                    <PencilAltIcon />
                                                </ActionIcon>
                                            </Group>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>
                </>
            )}

            {currentNotesHolder && (
                <Modal opened={true} onClose={() => setCurrentNotesHolder(undefined)} title="Note" size="xl" centered>
                    <Notes processing={currentNotesHolder} onSave={() => saveNotes()} />
                </Modal>
            )}
        </Layout>
    ) : (
        <>La commessa è vuota</>
    );
};

export default Operative;
