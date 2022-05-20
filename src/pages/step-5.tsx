import { Fragment, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, FetchResult, ProcessDefinition } from 'types';

import { ActionIcon, Button, NumberInput, Select, TextInput, Title } from '@mantine/core';

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
            await mutate<FetchResult<Contract>>([url, queryFields], apiPatch(url, input));

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
            <span className="text-xs font-semibold italic">* Campi obbligatori</span>

            <Title order={2} mt="xl" mb="md">
                Genera da avviamenti
            </Title>

            <div className="flex items-end">
                <Select
                    label="Lavorazione"
                    size="xl"
                    variant="filled"
                    value={selectedProcess}
                    onChange={setSelectedProcess}
                    data={processes?.data.map(p => ({ value: p.id?.toString() || '', label: p.name })) || []}
                />

                <Select
                    label="Avviamento"
                    size="xl"
                    variant="filled"
                    className="ml-4"
                    value={selectedRun}
                    onChange={setSelectedRun}
                    data={contract?.press?.map(p => ({ value: p.id?.toString() || '', label: p.description ?? p.run_type.name })) || []}
                />

                <Button leftIcon={<PlusIcon className="icon-field-left" />} color="green" size="xl" variant="outline" className="ml-4" uppercase onClick={() => create()}>
                    Crea da avviamento
                </Button>
            </div>

            <form noValidate className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                {fields.map((v, i) => (
                    <Fragment key={v.id}>
                        {v.process_definition?.special && (
                            <div className="mb-4 flex items-end">
                                <TextInput label="Nome lavorazione" size="xl" variant="filled" className="flex-grow" disabled {...register(`processings.${i}.name` as const)} />

                                <Controller
                                    name={`processings.${i}.estimate_hours`}
                                    control={control}
                                    rules={{ required: 'Le ore preventivate sono obbligatorie' }}
                                    render={({ field, fieldState }) => (
                                        <NumberInput
                                            label="Ore preventivate"
                                            size="xl"
                                            variant="filled"
                                            className="ml-4"
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

                                <Controller
                                    name={`processings.${i}.expected_quantity`}
                                    control={control}
                                    rules={{ required: 'I fogli sono obbligatori' }}
                                    render={({ field, fieldState }) => (
                                        <NumberInput
                                            label="Fogli"
                                            size="xl"
                                            variant="filled"
                                            required
                                            className="ml-4"
                                            min={0}
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />

                                <ActionIcon size="xl" color="red" className="ml-4" onClick={() => removeProcessing(i)}>
                                    <TrashIcon />
                                </ActionIcon>
                            </div>
                        )}
                    </Fragment>
                ))}

                <div className="mt-8 flex">
                    <Button type="submit" size="xl" uppercase className="flex-grow">
                        Salva
                    </Button>
                </div>
            </form>
        </>
    );
};

export default Step5;
