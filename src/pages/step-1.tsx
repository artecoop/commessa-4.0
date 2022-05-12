import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '@mantine/notifications';

import fetchData from '@lib/api';

import { Contract, FetchResult } from 'types';

import { Button, NumberInput, Textarea, TextInput } from '@mantine/core';
import { DatePicker } from '@mantine/dates';

import { CalendarIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
};

const Step1: React.FC<Props> = ({ contract }: Props) => {
    const navigate = useNavigate();

    const {
        handleSubmit,
        register,
        control,
        reset,
        setValue,
        formState: { errors }
    } = useForm<Contract>();

    useEffect(() => {
        if (contract) {
            setValue('id', contract.id, { shouldDirty: true });
            setValue('number', contract.number, { shouldDirty: true });
            setValue('date', contract.date, { shouldDirty: true });
            setValue('customer', contract.customer, { shouldDirty: true });
            setValue('title', contract.title, { shouldDirty: true });
            setValue('description', contract.description, { shouldDirty: true });
            setValue('desired_delivery', contract.desired_delivery, { shouldDirty: true });
            setValue('estimate', contract.estimate, { shouldDirty: true });
            setValue('estimate_date', contract.estimate_date, { shouldDirty: true });
            setValue('representative', contract.representative, { shouldDirty: true });
            setValue('quantity', contract.quantity, { shouldDirty: true });
        }
    }, [contract, setValue]);

    const { mutate } = useSWRConfig();

    const onSubmit = async (input: Contract) => {
        console.log(input);

        const url = `/items/contracts${contract?.id ? `/${contract.id}` : ''}`;

        try {
            const result = await mutate<FetchResult<Contract>>(url, fetchData(url, input, contract?.id ? 'PATCH' : 'POST'));
            showNotification({ message: 'Commessa salvata con successo', color: 'green' });

            if (!contract?.id) {
                navigate(`/commesse/manage/${result?.data.id}`, { replace: true });
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <>
            <form noValidate className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex">
                    <Controller
                        name="number"
                        control={control}
                        rules={{ required: 'Il numero della commessa è obbligatorio' }}
                        render={({ field, fieldState }) => (
                            <NumberInput
                                label="Numero"
                                size="xl"
                                variant="filled"
                                required
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                disabled={contract !== undefined}
                            />
                        )}
                    />

                    <Controller
                        name="date"
                        control={control}
                        rules={{ required: 'La data della commessa è obbligatoria' }}
                        render={({ field, fieldState }) => (
                            <DatePicker
                                label="Data"
                                size="xl"
                                variant="filled"
                                required
                                inputFormat="DD/MM/YYYY"
                                className="ml-4"
                                icon={<CalendarIcon className="icon-field-left" />}
                                value={field.value}
                                defaultValue={new Date()}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                disabled={contract !== undefined}
                            />
                        )}
                    />

                    <TextInput
                        label="Cliente"
                        size="xl"
                        variant="filled"
                        className="ml-4 flex-grow"
                        required
                        {...register('customer', { required: 'Il cliente è obbligatorio' })}
                        error={errors.customer?.message}
                    />
                </div>

                <div className="mt-8">
                    <TextInput label="Titolo" size="xl" variant="filled" required {...register('title', { required: 'Il titolo è obbligatorio' })} error={errors.customer?.message} />

                    <Textarea label="Descrizione" size="xl" className="mt-4" variant="filled" {...register('description')} />
                </div>

                <div className="mt-8 flex">
                    <Controller
                        name="desired_delivery"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                label="Data consegna desiderata"
                                size="xl"
                                variant="filled"
                                inputFormat="DD/MM/YYYY"
                                icon={<CalendarIcon className="icon-field-left" />}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <TextInput label="Preventivo" size="xl" variant="filled" className="ml-4" {...register('estimate')} />

                    <Controller
                        name="estimate_date"
                        control={control}
                        render={({ field }) => (
                            <DatePicker
                                label="Data preventivo"
                                size="xl"
                                variant="filled"
                                inputFormat="DD/MM/YYYY"
                                className="ml-4"
                                icon={<CalendarIcon className="icon-field-left" />}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />

                    <TextInput label="Agente" size="xl" variant="filled" className="ml-4 flex-grow" {...register('representative')} />
                </div>

                <Controller
                    name="quantity"
                    control={control}
                    rules={{ required: 'La quantità è obbligatoria' }}
                    render={({ field, fieldState }) => (
                        <NumberInput label="Quantità" size="xl" variant="filled" className="mt-8 w-full" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                    )}
                />

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

export default Step1;
