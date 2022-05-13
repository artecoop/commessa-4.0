import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';
import { showNotification } from '@mantine/notifications';

import fetchData from '@lib/api';

import { Contract, FetchResult } from 'types';

import { ActionIcon, Button, NumberInput, Select, Textarea, TextInput } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

const Step5: React.FC<Props> = ({ contract, queryFields }: Props) => {
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
            const filteredProcessing = contract.processings?.filter(p => !['design', 'prepress'].includes(p.kind));
            setValue('processings', filteredProcessing ?? undefined);
        }
    }, [contract, setValue]);

    const { mutate } = useSWRConfig();

    const onSubmit = async (input: Contract) => {
        const url = `/items/contracts/${contract?.id}`;

        try {
            await mutate<FetchResult<Contract>>([url, queryFields], fetchData(url, input, 'PATCH'));

            showNotification({ message: 'Lavorazioni salvate con successo', color: 'green' });
        } catch (e) {
            const error = e as Error;
            showNotification({ message: error.message, color: 'red' });
        }
    };

    return (
        <>
            <span className="text-xs font-semibold italic">* Campi obbligatori</span>

            <div className="mt-8">
                <Button leftIcon={<PlusIcon className="icon-field-left" />} variant="outline" color="green" uppercase onClick={() => append({})}>
                    Aggiungi lavorazione
                </Button>
            </div>

            <form noValidate className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                {fields.map((v, i) => (
                    <div key={v.id} className="mb-4 flex items-center">
                        <div className="flex-grow">
                            <div key={v.id} className="flex justify-between">
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
                                            data={[
                                                { value: 'plastifica', label: 'Plastifica' },
                                                { value: 'folding', label: 'Piega' },
                                                { value: 'collection', label: 'Raccolta' },
                                                { value: 'filorefe', label: 'Filo refe' },
                                                { value: 'binding', label: 'Brossura' },
                                                { value: 'cut', label: 'Taglio' }
                                            ]}
                                        />
                                    )}
                                />

                                <Controller
                                    name={`processings.${i}.setup_hours`}
                                    control={control}
                                    rules={{ required: 'Le ore di setup sono obbligatorie' }}
                                    render={({ field, fieldState }) => (
                                        <NumberInput
                                            label="Ore setup"
                                            size="xl"
                                            variant="filled"
                                            className="ml-4"
                                            required
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
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
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name={`processings.${i}.working_hours`}
                                    control={control}
                                    rules={{ required: 'Le ore lavorate sono obbligatorie' }}
                                    render={({ field, fieldState }) => (
                                        <NumberInput
                                            label="Ore lavorate"
                                            size="xl"
                                            variant="filled"
                                            className="ml-4"
                                            required
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>

                            <Textarea label="Note" size="xl" className="mt-4" variant="filled" {...register(`processings.${i}.note` as const)} />
                        </div>

                        <ActionIcon variant="outline" size="xl" color="red" className="ml-4" onClick={() => remove(i)}>
                            <TrashIcon />
                        </ActionIcon>
                    </div>
                ))}

                <div className="mt-4 flex">
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
