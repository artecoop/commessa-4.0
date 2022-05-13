import { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';

import { Contract, FetchResult } from 'types';

import Layout from '@components/_layout';

import { Stepper, Title } from '@mantine/core';

import Step1 from './step-1';
import Step2 from './step-2';
import Step3 from './step-3';
import Step4 from './step-4';
import Step5 from './step-5';

const Manage: React.FC = () => {
    const { id } = useParams();

    const queryFields = { fields: ['*', 'processings.*', 'offset_prints.*', 'digital_prints.*'] };

    const { data: contract } = useSWR<FetchResult<Contract>>(id ? [`/items/contracts/${id}`, queryFields] : null);

    const [active, setActive] = useState(0);

    return (
        <Layout title="Campi della Commessa">
            <Title order={1} mb="lg">
                Campi della Commessa
            </Title>

            <Stepper active={active} onStepClick={setActive}>
                <Stepper.Step label="Generale" description="Info generali sulla commessa">
                    <Step1 contract={contract?.data} />
                </Stepper.Step>
                <Stepper.Step label="Grafica e Prestampa" description="Grafica, impaginazione, prestampa, etc...">
                    <Step2 contract={contract?.data} queryFields={queryFields} />
                </Stepper.Step>
                <Stepper.Step label="Avviamenti offset" description="Definisci gli avviamenti per l'offset">
                    <Step3 contract={contract?.data} queryFields={queryFields} />
                </Stepper.Step>
                <Stepper.Step label="Avviamenti digitale" description="Definisci gli avviamenti per la stampa digitale">
                    <Step4 contract={contract?.data} queryFields={queryFields} />
                </Stepper.Step>
                <Stepper.Step label="Altri lavori" description="Cartotecnica, etc...">
                    <Step5 contract={contract?.data} queryFields={queryFields} />
                </Stepper.Step>
            </Stepper>
        </Layout>
    );
};

export default Manage;
