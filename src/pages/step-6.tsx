import { Fragment, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { error, success } from '@lib/notification';

import { apiPatch } from '@lib/api';

import { Contract, FetchResult, ProcessDefinition } from 'types';

import { ActionIcon, Button, NumberInput, Select, TextInput } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

const Step6: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: processes } = useSWR<FetchResult<ProcessDefinition[]>>(['/items/process_definition', { filter: { pre: false, special: false } }]);

    const {
        handleSubmit,
        register,
        control,
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

            <form noValidate className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                {fields.map((v, i) => (
                    <Fragment key={v.id}>
                        {(!v.process_definition || (!v.process_definition.pre && !v.process_definition.special)) && (
                            <div className="mb-4 flex">
                                <Controller
                                    name={`processings.${i}.process_definition`}
                                    control={control}
                                    rules={{ required: 'La lavorazione è obbligatoria' }}
                                    render={({ field, fieldState }) => (
                                        <Select
                                            label="Lavorazione"
                                            size="xl"
                                            variant="filled"
                                            required
                                            value={field.value?.id?.toString()}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                            data={processes?.data.map(p => ({ value: (p.id as number).toString(), label: p.name })) ?? []}
                                        />
                                    )}
                                />

                                <TextInput
                                    label="Nome lavorazione"
                                    size="xl"
                                    variant="filled"
                                    className="ml-4 flex-grow"
                                    required
                                    {...register(`processings.${i}.name` as const, { required: 'Il nome lavorazione è obbligatorio' })}
                                    error={errors.processings?.[i]?.name?.message}
                                />

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
                                    render={({ field }) => (
                                        <NumberInput label="Quantità" size="xl" variant="filled" className="ml-4" min={0} precision={1} step={0.5} value={field.value} onChange={field.onChange} />
                                    )}
                                />

                                <div className="ml-8 flex items-end pb-2">
                                    <ActionIcon size="xl" color="red" onClick={() => removeProcessing(i)}>
                                        <TrashIcon />
                                    </ActionIcon>
                                </div>
                            </div>
                        )}
                    </Fragment>
                ))}

                <Button leftIcon={<PlusIcon className="icon-field-left" />} color="green" variant="outline" uppercase onClick={() => append({})} className="mt-8">
                    Aggiungi lavorazione
                </Button>

                <Button type="submit" size="xl" uppercase className="mt-8 w-full">
                    Salva
                </Button>
            </form>
        </>
    );
};

export default Step6;
