import { Fragment, useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, FetchResult, ProcessDefinition } from 'types';
import { processings } from 'values';

import { ActionIcon, Button, NumberInput, Select, Textarea, TextInput, Title } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

const Step5: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: processes } = useSWR<FetchResult<ProcessDefinition[]>>(['/items/process_definition', { filter: { special: true } }]);

    const [selectedProcess, setSelectedProcess] = useState<string | null>();

    const {
        handleSubmit,
        register,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<Contract>();
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

    const generateFromRuns = () => {
        if (selectedProcess) {
            contract?.press?.forEach(p => {
                append({
                    id: Math.round(Math.random() * 9999), //temporary
                    process_definition: processes?.data.find(d => d.id === +selectedProcess),
                    name: `${processes?.data.find(d => d.id === +selectedProcess)?.name} avviamento ${p.run_type.name}`,
                    expected_quantity: p.sheets ?? Math.ceil(contract.quantity / p.yield)
                });
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

            <div className="flex">
                <Select
                    label="Lavorazione"
                    size="xl"
                    variant="filled"
                    value={selectedProcess}
                    onChange={setSelectedProcess}
                    data={processes?.data.map(p => ({ value: p.id?.toString() || '', label: p.name })) || []}
                />

                <Button leftIcon={<PlusIcon className="icon-field-left" />} variant="outline" color="green" uppercase onClick={() => generateFromRuns()}>
                    Genera da avviamenti
                </Button>
            </div>

            <form noValidate className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                {fields
                    .filter(f => f.process_definition.special)
                    .map((v, i) => (
                        <div key={v.id} className="mb-4 flex">
                            <TextInput label="Nome lavorazione" size="xl" variant="filled" className="flex-grow" disabled {...register(`processings.${i}.name` as const)} />

                            <Controller
                                name={`processings.${i}.estimate_hours`}
                                control={control}
                                render={({ field }) => (
                                    <NumberInput label="Ore preventivate" size="xl" variant="filled" className="ml-4" min={0} precision={1} step={0.5} value={field.value} onChange={field.onChange} />
                                )}
                            />

                            <Controller
                                name={`processings.${i}.expected_quantity`}
                                control={control}
                                render={({ field }) => <NumberInput label="Ore preventivate" size="xl" variant="filled" className="ml-4" min={0} value={field.value} onChange={field.onChange} />}
                            />

                            <ActionIcon variant="outline" size="xl" color="red" className="ml-4" onClick={() => removeProcessing(i)}>
                                <TrashIcon />
                            </ActionIcon>
                        </div>
                    ))}

                <div className="mt-8 flex">
                    <Button type="submit" size="xl" uppercase variant="outline" className="flex-grow">
                        Salva
                    </Button>
                </div>
            </form>
        </>
    );
};

export default Step5;
