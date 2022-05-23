import { Fragment, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, Press, FetchResult, Paper, RunType } from 'types';

import { ActionIcon, Button, NumberInput, Select, Switch, Table, TextInput, Title, Text, Grid } from '@mantine/core';

import { TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

type Form = Omit<Press, 'run_type' | 'paper' | 'color'> & {
    run_type: string;
    paper: string;
    color: boolean;
};

const Step4: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: papers } = useSWR<FetchResult<Paper[]>>(['/items/paper', { sort: ['name'] }]);
    const { data: runTypes } = useSWR<FetchResult<RunType[]>>(['/items/run_type', { filter: { kind: 'digital' } }]);

    const { control: contractControl, handleSubmit: contractHandleSubmit, setValue: contractSetValue } = useForm<Contract>();
    const {
        fields: pressFields,
        append: appendPress,
        remove: removePress
    } = useFieldArray({
        control: contractControl,
        name: 'press'
    });

    const {
        handleSubmit: realFormHandleSubmit,
        register: realFormRegister,
        control: realFormControl,
        formState: { errors: realFormErrors }
    } = useForm<Form>();

    useEffect(() => {
        if (contract) {
            contractSetValue('press', contract.press ?? undefined);
        }
    }, [contract, contractSetValue]);

    const onSubmit = (input: Form) => {
        const { run_type, paper, color, ...rest } = input;

        const parsed = {
            run_type: runTypes?.data.find(r => r.id === +run_type),
            colors: color ? ['c', 'm', 'y', 'k'] : ['k'],
            paper: papers?.data.find(p => p.id === +paper),
            ...rest
        } as Press;

        if (parsed.colors && parsed.colors.length === 0) {
            parsed.colors = undefined;
        }

        if (parsed.pantones && parsed.pantones.length === 0) {
            parsed.pantones = undefined;
        }

        appendPress(parsed);
    };

    const { mutate } = useSWRConfig();
    const saveContract = async (input: Contract) => {
        const url = `/items/contracts/${contract?.id}`;

        try {
            await mutate([url, queryFields], apiPatch(url, input));

            success('Avviamenti salvati con successo');
        } catch (e) {
            error(e);
        }
    };

    return (
        <>
            <Text size="sm" weight={500}>
                * Campi obbligatori
            </Text>

            <form noValidate onSubmit={realFormHandleSubmit(onSubmit)}>
                <Grid justify="center" align="center" mt="lg">
                    <Grid.Col span={2}>
                        <Controller
                            name="run_type"
                            control={realFormControl}
                            rules={{ required: 'Il tipo di avviamento è obbligatorio' }}
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Avviamento"
                                    size="xl"
                                    variant="filled"
                                    required
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    data={runTypes?.data.map(r => ({ value: r.id?.toString() || '', label: r.name })) ?? []}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <TextInput
                            label="Descrizione"
                            size="xl"
                            variant="filled"
                            required
                            {...realFormRegister('description', { required: 'La descrizione è obbligatoria' })}
                            error={realFormErrors.description?.message}
                        />
                    </Grid.Col>

                    <Grid.Col span={1}>
                        <Switch label="Colori" size="xl" {...realFormRegister('color')} defaultChecked={true} />
                    </Grid.Col>

                    <Grid.Col span={2}>
                        <Controller
                            name="paper"
                            control={realFormControl}
                            rules={{ required: 'La carta è obbligatoria' }}
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Carta"
                                    size="xl"
                                    variant="filled"
                                    required
                                    value={field.value?.toString()}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    data={papers?.data.map(p => ({ value: p.id?.toString() || '', label: `${p.name} ${p.weight}gr ${p.format} ${p.orientation ?? ''}` })) || []}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={2}>
                        <Controller
                            name="yield"
                            control={realFormControl}
                            rules={{ required: 'La resa è obbligatoria' }}
                            render={({ field, fieldState }) => (
                                <NumberInput label="Resa" size="xl" variant="filled" required min={1} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={2}>
                        <Controller
                            name="sheets"
                            control={realFormControl}
                            rules={{ required: 'I fogli sono obbligatori' }}
                            render={({ field, fieldState }) => (
                                <NumberInput label="Fogli" size="xl" variant="filled" required min={1} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col>
                        <Button type="submit" size="sm" color="lime" variant="outline" uppercase fullWidth>
                            Aggiungi avviamento
                        </Button>
                    </Grid.Col>
                </Grid>
            </form>

            {pressFields.filter(p => p.run_type?.kind === 'digital').length > 0 && (
                <>
                    <Title order={2} my="md">
                        Avviamenti
                    </Title>

                    <Table striped fontSize="lg" mt="xl">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Descrizione</th>
                                <th>Colori</th>
                                <th>Carta</th>
                                <th>Resa</th>
                                <th>Fogli</th>
                                <th className="action-1" />
                            </tr>
                        </thead>
                        <tbody>
                            {pressFields.map((p, i) => (
                                <Fragment key={p.id}>
                                    {p.run_type?.kind === 'digital' && (
                                        <tr>
                                            <td>{p.run_type?.name}</td>
                                            <td>{p.description}</td>
                                            <td>{p.colors && p.colors.length > 1 ? 'SI' : 'NO'}</td>
                                            <td>
                                                {p.paper?.name} {p.paper?.weight}gr {p.paper?.format} {p.paper?.orientation}
                                            </td>
                                            <td>{p.yield}</td>
                                            <td>{p.sheets}</td>
                                            <td>
                                                <ActionIcon color="red" size="lg" onClick={() => removePress(i)}>
                                                    <TrashIcon />
                                                </ActionIcon>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}

            <Button size="xl" uppercase onClick={contractHandleSubmit(saveContract)} fullWidth mt="xl">
                Salva
            </Button>
        </>
    );
};

export default Step4;
