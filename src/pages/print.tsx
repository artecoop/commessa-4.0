import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import { Contract, FetchResult } from 'types';

import { Button, Divider, SimpleGrid, Table, Title } from '@mantine/core';

const Print: React.FC = () => {
    const { id } = useParams();

    const url = `/items/contracts/${id}`;
    const queryFields = { fields: ['*', 'processings.*', 'processings.process_definition.*', 'processings.notes.*', 'press.*', 'press.paper.*', 'press.run_type.*', 'press.varnish.*'] };
    const key = [url, queryFields];

    const { data: contract } = useSWR<FetchResult<Contract>>(key);

    const printPDF = async () => {
        const domElement = document.getElementById('content');
        if (domElement) {
            const w = domElement.offsetWidth;
            const h = domElement.offsetHeight;
            const c = document.createElement('canvas');
            const opts = {
                scale: 2,
                canvas: c,
                width: w,
                height: h
            };
            c.width = w * 2;
            c.height = h * 2;
            c.getContext('2d');

            const canvas = await html2canvas(domElement, opts);
            const contentWidth = canvas.width;
            const contentHeight = canvas.height;
            const pageHeight = (contentWidth / 839) * 1188;
            let leftHeight = contentHeight;
            let position = 0;
            const imgWidth = 842;
            const imgHeight = (839 / contentWidth) * contentHeight;

            const pageData = canvas.toDataURL('image/jpeg', 1.0);

            const pdf = new jsPDF('p', 'pt', 'a3');

            if (leftHeight < pageHeight) {
                pdf.addImage(pageData, 'JPEG', 10, 10, imgWidth * 0.98, imgHeight * 0.98);
            } else {
                while (leftHeight > 0) {
                    pdf.addImage(pageData, 'JPEG', 10, position + 10, imgWidth * 0.98, imgHeight * 0.98);
                    leftHeight -= pageHeight;
                    position -= 1188;
                    if (leftHeight > 0) {
                        pdf.addPage();
                    }
                }
            }

            pdf.save(`${contract?.data.title}.pdf`);
        }
    };

    return (
        <>
            <Button size="xl" uppercase onClick={() => printPDF()}>
                Stampa
            </Button>
            <div id="content" style={{ width: '32cm' }}>
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
                                    <th>Tipo</th>
                                    <th>Nome</th>
                                    <th>Ore lavorate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract?.data.processings
                                    ?.filter(p => p.process_definition?.pre)
                                    ?.map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <b>{p.process_definition?.name}</b>
                                            </td>
                                            <td>{p.name}</td>
                                            <td>{p.working_hours}</td>
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
                                </tr>
                            </thead>
                            <tbody>
                                {contract?.data.press
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
                                            <td>{op.sheets ?? '-'}</td>
                                            <td>
                                                {op.paper.name} {op.paper.weight}gr {op.paper.format} {op.paper.orientation}
                                            </td>
                                            <td>{op.working_hours}</td>
                                            <td>{op.consumed_sheets}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>

                        <Title order={3} mt="xl">
                            Lastre:&nbsp;
                            {contract?.data.press
                                .filter(p => p.run_type?.kind === 'offset')
                                .flatMap(op => op.colors)
                                .filter(op => op && op.length > 0).length +
                                contract?.data.press
                                    .filter(p => p.run_type?.kind === 'offset')
                                    .flatMap(op => op.pantones)
                                    .filter(op => op !== null).length +
                                contract?.data.press
                                    .filter(p => p.run_type?.kind === 'offset')
                                    .flatMap(op => op.varnish)
                                    .filter(v => v?.add_plate).length}
                            &nbsp;- Fogli:&nbsp;
                            {contract?.data.press.filter(p => p.run_type?.kind === 'offset').reduce((acc, curr) => acc + (curr.sheets ?? 0), 0)}
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
                                    <th>Tipo</th>
                                    <th>Descrizione</th>
                                    <th>Colori</th>
                                    <th>Resa</th>
                                    <th>Fogli</th>
                                    <th>Carta</th>
                                    <th>Ore lavorate</th>
                                    <th>Fogli usati</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract?.data.press
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
                                            <td>
                                                {dp.paper.name} {dp.paper.weight}gr {dp.paper.format} {dp.paper.orientation}
                                            </td>
                                            <td>{dp.working_hours}</td>
                                            <td>{dp.consumed_sheets}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>

                        <Title order={3} mt="xl">
                            Fogli:&nbsp;
                            {contract?.data.press.filter(p => p.run_type?.kind === 'digital').reduce((acc, curr) => acc + (curr.sheets ?? 0), 0)}
                        </Title>
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
                                    <th>Tipo</th>
                                    <th>Descrizione</th>
                                    <th>Ore setup</th>
                                    <th>Ore lavorazione</th>
                                    <th>Quantità</th>
                                    <th>Quantità effettiva</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contract?.data.processings
                                    .filter(p => !p.process_definition?.pre)
                                    .map(p => (
                                        <tr key={p.id}>
                                            <td>
                                                <b>{p.process_definition?.name}</b>
                                            </td>
                                            <td>{p.name}</td>
                                            <td>{p.setup_hours}</td>
                                            <td>{p.working_hours}</td>
                                            <td>{p.expected_quantity ?? '-'}</td>
                                            <td>{p.actual_quantity}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </Table>
                    </>
                )}
            </div>
        </>
    );
};

export default Print;
