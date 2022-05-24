import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';
import { useNavigate } from 'react-router-dom';

import { apiPatch, apiPost } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, FetchResult } from 'types';

import { Button, NumberInput, Textarea, TextInput, Text, Grid } from '@mantine/core';
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
        const url = `/items/contracts${contract?.id ? `/${contract.id}` : ''}`;

        try {
            const result = await mutate<FetchResult<Contract>>(url, contract?.id ? apiPatch(url, input) : apiPost(url, input));
            success('Commessa salvata con successo');

            if (!contract?.id) {
                navigate(`/commesse/manage/${result?.data.id}`, { replace: true });
            }
        } catch (e) {
            error(e);
        }
    };

    return (
        <>
            <Text size="sm" weight={500}>
                * Campi obbligatori
            </Text>

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Grid justify="center" align="center" mt="lg">
                    <Grid.Col span={3}>
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
                                    min={1}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    disabled={contract !== undefined}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={2}>
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
                                    icon={<CalendarIcon className="icon-field-left" />}
                                    value={field.value && new Date(field.value)}
                                    defaultValue={new Date()}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    disabled={contract !== undefined}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={7}>
                        <TextInput label="Cliente" size="xl" variant="filled" required {...register('customer', { required: 'Il cliente è obbligatorio' })} error={errors.customer?.message} />
                    </Grid.Col>

                    <Grid.Col>
                        <TextInput label="Titolo" size="xl" variant="filled" required {...register('title', { required: 'Il titolo è obbligatorio' })} error={errors.title?.message} />
                    </Grid.Col>

                    <Grid.Col>
                        <Textarea label="Descrizione" size="xl" variant="filled" {...register('description')} />
                    </Grid.Col>

                    <Grid.Col span={2}>
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
                                    value={field.value && new Date(field.value)}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={2}>
                        <TextInput label="Preventivo" size="xl" variant="filled" {...register('estimate')} />
                    </Grid.Col>

                    <Grid.Col span={2}>
                        <Controller
                            name="estimate_date"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    label="Data preventivo"
                                    size="xl"
                                    variant="filled"
                                    inputFormat="DD/MM/YYYY"
                                    icon={<CalendarIcon className="icon-field-left" />}
                                    value={field.value && new Date(field.value)}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={6}>
                        <TextInput label="Agente" size="xl" variant="filled" required {...register('representative', { required: "L'agente è obbligatorio" })} error={errors.representative?.message} />
                    </Grid.Col>

                    <Grid.Col>
                        <Controller
                            name="quantity"
                            control={control}
                            rules={{ required: 'La quantità è obbligatoria' }}
                            render={({ field, fieldState }) => (
                                <NumberInput label="Quantità" size="xl" variant="filled" required min={1} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={11}>
                        <Button type="submit" size="xl" uppercase fullWidth>
                            Salva
                        </Button>
                    </Grid.Col>

                    <Grid.Col span={1}>
                        <Button size="xl" uppercase color="red" fullWidth onClick={() => reset(contract)}>
                            Reset
                        </Button>
                    </Grid.Col>
                </Grid>
            </form>
        </>
    );
};

export default Step1;
