import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import { apiPatch } from '@lib/api';
import { success, error } from '@lib/notification';

import { Contract, FetchResult, Press, Processing } from 'types';

import Layout from '@components/_layout';
import Notes from '@components/notes';

import { ActionIcon, Divider, Group, Indicator, Modal, NumberInput, ScrollArea, SimpleGrid, Table, Title } from '@mantine/core';

import { CheckIcon, PencilAltIcon } from '@heroicons/react/outline';

const Operative: React.FC = () => {
    const { id } = useParams();

    const url = `/items/contracts/${id}`;
    const queryFields = { fields: ['*', 'processings.*', 'processings.process_definition.*', 'processings.notes.*', 'press.*', 'press.paper.*', 'press.run_type.*', 'press.varnish.*'] };
    const key = [url, queryFields];

    const { data: contract } = useSWR<FetchResult<Contract>>(key);

    const { mutate } = useSWRConfig();

    const saveProcessing = async (id: number) => {
        const setup_hours = (document.getElementById(`processing_setup_hours_${id}`) as HTMLInputElement)?.value;
        const working_hours = (document.getElementById(`processing_working_hours_${id}`) as HTMLInputElement).value;
        const actual_quantity = (document.getElementById(`processing_actual_quantity_${id}`) as HTMLInputElement)?.value;

        try {
            await mutate(
                key,
                apiPatch(url, {
                    processings: {
                        update: [
                            {
                                id,
                                setup_hours: setup_hours && +setup_hours > 0 ? +setup_hours : null,
                                working_hours: working_hours && +working_hours > 0 ? +working_hours : null,
                                actual_quantity: actual_quantity && +actual_quantity > 0 ? +actual_quantity : null
                            }
                        ]
                    }
                })
            );

            success('Lavorazione salvata con successo');
        } catch (e) {
            error(e);
        }
    };

    const savePress = async (id: number) => {
        const working_hours = (document.getElementById(`press_working_hours_${id}`) as HTMLInputElement).value;
        const setup_sheets = (document.getElementById(`press_setup_sheets_${id}`) as HTMLInputElement).value;
        const produced_sheets = (document.getElementById(`press_produced_sheets_${id}`) as HTMLInputElement).value;
        const wasted_sheets = (document.getElementById(`press_wasted_sheets_${id}`) as HTMLInputElement).value;

        try {
            await mutate(
                key,
                apiPatch(url, {
                    press: {
                        update: [
                            {
                                id,
                                working_hours: working_hours && +working_hours > 0 ? +working_hours : null,
                                setup_sheets: setup_sheets && +setup_sheets > 0 ? +setup_sheets : null,
                                produced_sheets: produced_sheets && +produced_sheets > 0 ? +produced_sheets : null,
                                wasted_sheets: wasted_sheets && +wasted_sheets > 0 ? +wasted_sheets : null
                            }
                        ]
                    }
                })
            );

            success('Avviamento salvato con successo');
        } catch (e) {
            error(e);
        }
    };

    const [currentNotesHolder, setCurrentNotesHolder] = useState<{ type: 'processings' | 'press'; reference: Processing | Press }>();

    const saveNotes = async () => {
        if (currentNotesHolder) {
            try {
                await mutate(
                    key,
                    apiPatch(url, {
                        [currentNotesHolder.type]: {
                            update: [
                                {
                                    id: currentNotesHolder.reference.id,
                                    notes: currentNotesHolder.reference.notes
                                }
                            ]
                        }
                    })
                );

                success('Note salvate con successo');
            } catch (e) {
                error(e);
            }

            // setCurrentNotesHolder(undefined);
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

            <SimpleGrid
                cols={5}
                breakpoints={[
                    { maxWidth: 980, cols: 3, spacing: 'md' },
                    { maxWidth: 755, cols: 2, spacing: 'sm' },
                    { maxWidth: 600, cols: 1, spacing: 'sm' }
                ]}
                mt="xl"
            >
                <div>
                    <b>Quantità</b>: <br />
                    {contract.data.quantity}
                </div>

                <div>
                    <b>Cliente</b>:<br /> {contract.data.customer}
                </div>

                {contract.data.desired_delivery && (
                    <div>
                        <b>Data di consegna</b>:<br /> {dayjs(contract.data.desired_delivery).format('DD/MM/YYYY')}
                    </div>
                )}

                {contract?.data.estimate && (
                    <div>
                        <b>Preventivo</b>: <br />
                        {contract?.data.estimate}
                    </div>
                )}

                {contract?.data.estimate_date && (
                    <div>
                        <b>Data preventivo</b>: <br />
                        {dayjs(contract?.data.estimate_date).format('DD/MM/YYYY')}
                    </div>
                )}

                <div>
                    <b>Agente</b>:<br /> {contract.data.representative}
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

                    <ScrollArea>
                        <Table striped fontSize="lg" mt="xl" style={{ minWidth: 600 }}>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Nome</th>
                                    <th style={{ width: '200px' }}>Ore lavorate</th>
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
                                            <td>
                                                <NumberInput id={`processing_working_hours_${p.id}`} size="xl" min={0.5} step={0.5} defaultValue={p.working_hours ?? undefined} />
                                            </td>
                                            <td>
                                                <Group spacing="xs">
                                                    <ActionIcon color="green" size="xl" onClick={() => saveProcessing(p.id as number)}>
                                                        <CheckIcon />
                                                    </ActionIcon>

                                                    <ActionIcon color="primary" size="xl" onClick={() => setCurrentNotesHolder({ type: 'processings', reference: p })}>
                                                        <Indicator color="red" disabled={p.notes === null || p.notes?.length === 0}>
                                                            <PencilAltIcon />
                                                        </Indicator>
                                                    </ActionIcon>
                                                </Group>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </ScrollArea>
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

                    <ScrollArea>
                        <Table striped fontSize="lg" mt="xl" style={{ minWidth: 2000 }}>
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
                                    <th style={{ width: '200px' }}>Ore lavorate</th>
                                    <th style={{ width: '200px' }}>Fogli setup</th>
                                    <th style={{ width: '200px' }}>Fogli prodotti</th>
                                    <th style={{ width: '200px' }}>Fogli di scarto</th>
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
                                            <td>{op.sheets}</td>
                                            <td>
                                                {op.paper.name} {op.paper.weight}gr {op.paper.format} {op.paper.orientation}
                                            </td>
                                            <td>
                                                <NumberInput id={`press_working_hours_${op.id}`} size="xl" min={0.5} step={0.5} defaultValue={op.working_hours ?? undefined} />
                                            </td>
                                            <td>
                                                <NumberInput id={`press_setup_sheets_${op.id}`} size="xl" min={0.5} step={0.5} defaultValue={op.setup_sheets ?? undefined} />
                                            </td>
                                            <td>
                                                <NumberInput id={`press_produced_sheets_${op.id}`} size="xl" min={0.5} step={0.5} defaultValue={op.produced_sheets ?? undefined} />
                                            </td>
                                            <td>
                                                <NumberInput id={`press_wasted_sheets_${op.id}`} size="xl" min={0.5} step={0.5} defaultValue={op.wasted_sheets ?? undefined} />
                                            </td>
                                            <td>
                                                <Group spacing="xs">
                                                    <ActionIcon color="green" size="xl" onClick={() => savePress(op.id as number)}>
                                                        <CheckIcon />
                                                    </ActionIcon>

                                                    <ActionIcon color="primary" size="xl" onClick={() => setCurrentNotesHolder({ type: 'press', reference: op })}>
                                                        <Indicator color="red" disabled={op.notes === null || op.notes?.length === 0}>
                                                            <PencilAltIcon />
                                                        </Indicator>
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
                            {contract.data.press.filter(p => p.run_type?.kind === 'offset').reduce((acc, curr) => acc + (curr.sheets ?? 0), 0)}
                        </Title>
                    </ScrollArea>
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

                    <ScrollArea>
                        <Table striped fontSize="lg" mt="xl" style={{ minWidth: 2000 }}>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Descrizione</th>
                                    <th>Colori</th>
                                    <th>Resa</th>
                                    <th>Fogli</th>
                                    <th>Carta</th>
                                    <th style={{ width: '200px' }}>Ore lavorate</th>
                                    <th style={{ width: '200px' }}>Fogli setup</th>
                                    <th style={{ width: '200px' }}>Fogli prodotti</th>
                                    <th style={{ width: '200px' }}>Fogli di scarto</th>
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
                                                <NumberInput id={`press_working_hours_${dp.id}`} size="xl" min={0.5} step={0.5} defaultValue={dp.working_hours ?? undefined} />
                                            </td>
                                            <td>
                                                <NumberInput id={`press_setup_sheets_${dp.id}`} size="xl" min={0.5} step={0.5} defaultValue={dp.setup_sheets ?? undefined} />
                                            </td>
                                            <td>
                                                <NumberInput id={`press_produced_sheets_${dp.id}`} size="xl" min={0.5} step={0.5} defaultValue={dp.produced_sheets ?? undefined} />
                                            </td>
                                            <td>
                                                <NumberInput id={`press_wasted_sheets_${dp.id}`} size="xl" min={0.5} step={0.5} defaultValue={dp.wasted_sheets ?? undefined} />
                                            </td>
                                            <td>
                                                <Group spacing="xs">
                                                    <ActionIcon color="green" size="xl" onClick={() => savePress(dp.id as number)}>
                                                        <CheckIcon />
                                                    </ActionIcon>

                                                    <ActionIcon color="primary" size="xl" onClick={() => setCurrentNotesHolder({ type: 'press', reference: dp })}>
                                                        <Indicator color="red" disabled={dp.notes === null || dp.notes?.length === 0}>
                                                            <PencilAltIcon />
                                                        </Indicator>
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
                    </ScrollArea>
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

                    <ScrollArea>
                        <Table striped fontSize="lg" mt="xl" style={{ minWidth: 1400 }}>
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Descrizione</th>
                                    <th style={{ width: '200px' }}>Ore setup</th>
                                    <th style={{ width: '200px' }}>Ore lavorazione</th>
                                    <th>Quantità</th>
                                    <th style={{ width: '200px' }}>Quantità effettiva</th>
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
                                            <td>
                                                <NumberInput id={`processing_setup_hours_${p.id}`} size="xl" min={0.5} step={0.5} defaultValue={p.setup_hours ?? undefined} />
                                            </td>
                                            <td>
                                                <NumberInput id={`processing_working_hours_${p.id}`} size="xl" min={0.5} step={0.5} defaultValue={p.working_hours ?? undefined} />
                                            </td>
                                            <td>{p.expected_quantity ?? '-'}</td>
                                            <td>
                                                <NumberInput id={`processing_actual_quantity_${p.id}`} size="xl" min={0.5} step={0.5} defaultValue={p.actual_quantity ?? undefined} />
                                            </td>
                                            <td>
                                                <Group spacing="xs">
                                                    <ActionIcon color="green" size="xl" onClick={() => saveProcessing(p.id as number)}>
                                                        <CheckIcon />
                                                    </ActionIcon>

                                                    <ActionIcon color="primary" size="xl" onClick={() => setCurrentNotesHolder({ type: 'processings', reference: p })}>
                                                        <Indicator color="red" disabled={p.notes === null || p.notes?.length === 0}>
                                                            <PencilAltIcon />
                                                        </Indicator>
                                                    </ActionIcon>
                                                </Group>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </ScrollArea>
                </>
            )}

            {currentNotesHolder && (
                <Modal opened={true} onClose={() => setCurrentNotesHolder(undefined)} title="Note" size="xl" centered>
                    <Notes processing={currentNotesHolder.reference} onSave={() => saveNotes()} />
                </Modal>
            )}
        </Layout>
    ) : (
        <>La commessa è vuota</>
    );
};

export default Operative;
