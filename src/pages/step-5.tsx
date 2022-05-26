import { Fragment, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, FetchResult, ProcessDefinition } from 'types';

import { ActionIcon, Button, NumberInput, Select, TextInput, Title, Text, Grid } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

const Step5: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: processes } = useSWR<FetchResult<ProcessDefinition[]>>(['/items/process_definition', { filter: { special: true } }]);

    const [selectedProcess, setSelectedProcess] = useState<string | null>();
    const [selectedRun, setSelectedRun] = useState<string | null>();

    const { handleSubmit, register, control, setValue } = useForm<Contract>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'processings'
    });

    useEffect(() => {
        if (contract) {
            setValue('processings', contract.processings ?? undefined);
        }
    }, [contract, setValue]);

    const { mutate } = useSWRConfig();

    const create = () => {
        if (selectedProcess && selectedRun) {
            const process = processes?.data.find(d => d.id === +selectedProcess);
            const run = contract?.press?.find(p => p.id === +selectedRun);

            append({
                process_definition: process,
                name: `${process?.name} avviamento ${run?.description ?? run?.run_type.name}`,
                expected_quantity: run?.sheets ?? Math.ceil((contract?.quantity ?? 0) / (run?.yield ?? 0))
            });
        }
    };

    const onSubmit = async (input: Contract) => {
        const url = `/items/contracts/${contract?.id}`;

        try {
            await mutate([url, queryFields], apiPatch(url, input));

            success('Lavorazioni salvate con successo');
        } catch (e) {
            error(e);
        }
    };

    const removeProcessing = (i: number) => {
        if (confirm('Sei sicuro di voler eliminare questa lavorazione?')) {
            remove(i);
        }
    };

    return (
        <>
            <Text size="sm" weight={500}>
                * Campi obbligatori
            </Text>

            <Title order={4} my="lg">
                Genera da avviamenti
            </Title>

            <Grid align="end">
                <Grid.Col span={3}>
                    <Select
                        label="Lavorazione"
                        size="xl"
                        value={selectedProcess}
                        onChange={setSelectedProcess}
                        data={processes?.data.map(p => ({ value: p.id?.toString() || '', label: p.name })) || []}
                    />
                </Grid.Col>

                <Grid.Col span={3}>
                    <Select
                        label="Avviamento"
                        size="xl"
                        value={selectedRun}
                        onChange={setSelectedRun}
                        data={contract?.press?.map(p => ({ value: p.id?.toString() || '', label: p.description || p.run_type?.name })) || []}
                    />
                </Grid.Col>

                <Grid.Col span={3}>
                    <Button leftIcon={<PlusIcon className="icon-field-left" />} color="green" size="xl" variant="outline" uppercase onClick={() => create()}>
                        Crea da avviamento
                    </Button>
                </Grid.Col>
            </Grid>

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                {fields.map((v, i) => (
                    <Fragment key={v.id}>
                        {v.process_definition?.special && (
                            <Grid mt="lg" align="end" columns={24} grow>
                                <Grid.Col span={14}>
                                    <TextInput label="Nome lavorazione" size="xl" {...register(`processings.${i}.name` as const)} />
                                </Grid.Col>

                                <Grid.Col span={4}>
                                    <Controller
                                        name={`processings.${i}.estimate_hours`}
                                        control={control}
                                        rules={{ required: 'Le ore preventivate sono obbligatorie' }}
                                        render={({ field, fieldState }) => (
                                            <NumberInput
                                                label="Ore preventivate"
                                                size="xl"
                                                required
                                                min={0}
                                                precision={1}
                                                step={0.5}
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </Grid.Col>

                                <Grid.Col span={4}>
                                    <Controller
                                        name={`processings.${i}.expected_quantity`}
                                        control={control}
                                        rules={{ required: 'I fogli sono obbligatori' }}
                                        render={({ field, fieldState }) => (
                                            <NumberInput label="Fogli" size="xl" required min={0} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                                        )}
                                    />
                                </Grid.Col>

                                <Grid.Col span={1} pb="lg">
                                    <ActionIcon size="xl" color="red" onClick={() => removeProcessing(i)}>
                                        <TrashIcon />
                                    </ActionIcon>
                                </Grid.Col>
                            </Grid>
                        )}
                    </Fragment>
                ))}

                <Button type="submit" size="xl" uppercase fullWidth mt="xl">
                    Salva
                </Button>
            </form>
        </>
    );
};

export default Step5;
