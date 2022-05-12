import { useState } from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';

import Layout from '@components/_layout';

import { Stepper, Title } from '@mantine/core';

import Step1 from './step-1';
import { Contract, FetchResult } from 'types';

const Manage: React.FC = () => {
    const { id } = useParams();

    const { data: contract } = useSWR<FetchResult<Contract>>(id ? `/items/contracts/${id}` : null);

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
                <Stepper.Step label="Lavorazioni" description="Grafica, impaginaziione, prestampa, etc...">
                    Step 2 content: Verify email
                </Stepper.Step>
                <Stepper.Step label="Final step" description="Get full access">
                    Step 3 content: Get full access
                </Stepper.Step>
                <Stepper.Completed>Completed, click back button to get to previous step</Stepper.Completed>
            </Stepper>
        </Layout>
    );
};

export default Manage;
