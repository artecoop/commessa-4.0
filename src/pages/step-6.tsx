import { Fragment, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { error, success } from '@lib/notification';

import { apiPatch } from '@lib/api';

import { Contract, FetchResult, ProcessDefinition } from 'types';

import { ActionIcon, Button, NumberInput, Select, TextInput, Text, Grid } from '@mantine/core';

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

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                {fields.map((v, i) => (
                    <Fragment key={v.id}>
                        {(!v.process_definition || (!v.process_definition.pre && !v.process_definition.special)) && (
                            <Grid mt="lg">
                                <Grid.Col span={2}>
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
                                </Grid.Col>

                                <Grid.Col span={5}>
                                    <TextInput
                                        label="Nome lavorazione"
                                        size="xl"
                                        variant="filled"
                                        required
                                        {...register(`processings.${i}.name` as const, { required: 'Il nome lavorazione è obbligatorio' })}
                                        error={errors.processings?.[i]?.name?.message}
                                    />
                                </Grid.Col>

                                <Grid.Col span={2}>
                                    <Controller
                                        name={`processings.${i}.estimate_hours`}
                                        control={control}
                                        rules={{ required: 'Le ore preventivate sono obbligatorie' }}
                                        render={({ field, fieldState }) => (
                                            <NumberInput
                                                label="Ore preventivate"
                                                size="xl"
                                                variant="filled"
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

                                <Grid.Col span={2}>
                                    <Controller
                                        name={`processings.${i}.expected_quantity`}
                                        control={control}
                                        render={({ field }) => (
                                            <NumberInput label="Quantità" size="xl" variant="filled" min={0} precision={1} step={0.5} value={field.value} onChange={field.onChange} />
                                        )}
                                    />
                                </Grid.Col>

                                <Grid.Col span={1}>
                                    <ActionIcon size="xl" color="red" onClick={() => removeProcessing(i)}>
                                        <TrashIcon />
                                    </ActionIcon>
                                </Grid.Col>
                            </Grid>
                        )}
                    </Fragment>
                ))}

                <Button leftIcon={<PlusIcon className="icon-field-left" />} color="green" variant="outline" uppercase onClick={() => append({})} mt="xl">
                    Aggiungi lavorazione
                </Button>

                <Button type="submit" size="xl" uppercase fullWidth mt="xl">
                    Salva
                </Button>
            </form>
        </>
    );
};

export default Step6;
