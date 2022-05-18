import { Fragment, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, FetchResult } from 'types';
import { processings } from 'values';

import { ActionIcon, Button, NumberInput, Select, Textarea } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

const Step5: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { handleSubmit, register, control, reset, setValue } = useForm<Contract>();
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
                        {!['design', 'prepress'].includes(v.kind) && (
                            <div className="mb-4 flex items-center">
                                <div className="flex-grow">
                                    <div className="flex justify-between">
                                        <Controller
                                            name={`processings.${i}.kind`}
                                            control={control}
                                            rules={{ required: 'La lavorazione è obbligatoria' }}
                                            render={({ field, fieldState }) => (
                                                <Select
                                                    label="Lavorazione"
                                                    size="xl"
                                                    variant="filled"
                                                    required
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    error={fieldState.error?.message}
                                                    data={processings.filter(p => !['design', 'prepress'].includes(p.value))}
                                                />
                                            )}
                                        />

                                        <Controller
                                            name={`processings.${i}.setup_hours`}
                                            control={control}
                                            render={({ field }) => (
                                                <NumberInput
                                                    label="Ore setup"
                                                    size="xl"
                                                    variant="filled"
                                                    className="ml-4"
                                                    min={0}
                                                    precision={1}
                                                    step={0.5}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            )}
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
                                            name={`processings.${i}.working_hours`}
                                            control={control}
                                            render={({ field }) => (
                                                <NumberInput
                                                    label="Ore lavorate"
                                                    size="xl"
                                                    variant="filled"
                                                    className="ml-4"
                                                    min={0.5}
                                                    precision={1}
                                                    step={0.5}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            )}
                                        />
                                    </div>

                                    <Textarea label="Note" size="xl" className="mt-4" variant="filled" {...register(`processings.${i}.note` as const)} />
                                </div>

                                <ActionIcon variant="outline" size="xl" color="red" className="ml-4" onClick={() => removeProcessing(i)}>
                                    <TrashIcon />
                                </ActionIcon>
                            </div>
                        )}
                    </Fragment>
                ))}

                <div className="mt-8">
                    <Button leftIcon={<PlusIcon className="icon-field-left" />} variant="outline" color="green" uppercase onClick={() => append({})}>
                        Aggiungi lavorazione
                    </Button>
                </div>

                <div className="mt-8 flex">
                    <Button type="submit" size="xl" uppercase variant="outline" className="flex-grow">
                        Salva
                    </Button>
                    <Button variant="outline" size="xl" uppercase color="red" className="ml-4 w-36" onClick={() => reset(contract)}>
                        Reset
                    </Button>
                </div>
            </form>
        </>
    );
};

export default Step5;
