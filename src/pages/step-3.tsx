import { Fragment, useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, FetchResult, Press, Paper, Varnish, RunType } from 'types';

import { ActionIcon, Button, Checkbox, CheckboxGroup, NumberInput, Select, Table, TextInput, Title, Text, Grid, SimpleGrid, Group, Autocomplete } from '@mantine/core';

import AutoCompleteItem from '@components/autocomplete-item';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

type Form = Omit<Press, 'run_type' | 'paper' | 'varnish'> & {
    run_type: string;
    paper: string;
    varnish: string;
};

const Step3: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: papers } = useSWR<FetchResult<Paper[]>>(['/items/paper', { sort: ['name'] }]);
    const { data: runTypes } = useSWR<FetchResult<RunType[]>>(['/items/run_type', { filter: { kind: 'offset' } }]);
    const { data: varnishes } = useSWR<FetchResult<Varnish[]>>('/items/varnish');

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
    const {
        fields: pantoneFields,
        append: appendPantone,
        remove: removePantone
    } = useFieldArray({
        control: realFormControl,
        name: 'pantones'
    });

    useEffect(() => {
        if (contract) {
            contractSetValue('press', contract.press ?? undefined);
        }
    }, [contract, contractSetValue]);

    const onSubmit = (input: Form) => {
        console.log(input.paper);
        /* const { run_type, paper, varnish, ...rest } = input;

        const parsed = {
            run_type: runTypes?.data.find(r => r.id === +run_type),
            paper: papers?.data.find(p => p.id === +paper),
            varnish: varnishes?.data.find(v => v.id === +varnish),
            ...rest
        } as Press;

        if (parsed.colors && parsed.colors.length === 0) {
            parsed.colors = undefined;
        }

        if (parsed.pantones && parsed.pantones.length === 0) {
            parsed.pantones = undefined;
        }

        appendPress(parsed); */
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

    const buildPaperLabel = (p: Paper) => {
        return `${p.name} ${p.weight}gr ${p.format} ${p.orientation ?? ''}`;
    };

    return (
        <>
            <Text size="sm" weight={500}>
                * Campi obbligatori
            </Text>

            <form noValidate onSubmit={realFormHandleSubmit(onSubmit)}>
                <Grid columns={24} align="end" mt="lg">
                    <Grid.Col span={4}>
                        <Controller
                            name="run_type"
                            control={realFormControl}
                            rules={{ required: 'Il tipo di avviamento è obbligatorio' }}
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Avviamento"
                                    size="xl"
                                    required
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    data={runTypes?.data.map(r => ({ value: r.id?.toString() || '', label: r.name })) ?? []}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <TextInput label="Descrizione" size="xl" {...realFormRegister('description')} />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Controller
                            name="paper"
                            control={realFormControl}
                            rules={{ required: 'La carta è obbligatoria' }}
                            render={({ field, fieldState }) => (
                                <Autocomplete
                                    label="Carta"
                                    size="xl"
                                    required
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    itemComponent={AutoCompleteItem}
                                    data={papers?.data.map(p => ({ value: p.id?.toString() || '', label: buildPaperLabel(p) })) || []}
                                    filter={(value, item) => item.value.toLowerCase().includes(value.toLowerCase().trim()) || item.label.toLowerCase().includes(value.toLowerCase().trim())}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Controller
                            name="yield"
                            control={realFormControl}
                            rules={{ required: 'La resa è obbligatoria' }}
                            render={({ field, fieldState }) => <NumberInput label="Resa" size="xl" required min={1} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />}
                        />
                    </Grid.Col>

                    <Grid.Col span={8}>
                        <Controller
                            name="colors"
                            control={realFormControl}
                            render={({ field }) => (
                                <CheckboxGroup size="xl" label="Colori" value={field.value} onChange={field.onChange}>
                                    <Checkbox value="c" label="Cyan" />
                                    <Checkbox value="m" label="Magenta" />
                                    <Checkbox value="y" label="Giallo" />
                                    <Checkbox value="k" label="Nero" />
                                </CheckboxGroup>
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Controller
                            name="varnish"
                            control={realFormControl}
                            render={({ field }) => (
                                <Select
                                    label="Vernice"
                                    size="xl"
                                    value={field.value}
                                    onChange={field.onChange}
                                    data={varnishes?.data.map(r => ({ value: (r.id as number).toString(), label: r.name })) ?? []}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={12}>
                        <Button leftIcon={<PlusIcon className="icon-field-left" />} color="green" variant="outline" uppercase onClick={() => appendPantone({})}>
                            Aggiungi Pantone
                        </Button>

                        <SimpleGrid cols={4}>
                            {pantoneFields.map((v, i) => (
                                <Group key={v.id}>
                                    <TextInput
                                        label="Pantone"
                                        size="xl"
                                        required
                                        {...realFormRegister(`pantones.${i}.name` as const, { required: 'Il pantone è obbligatorio se aggiunto' })}
                                        error={realFormErrors.pantones?.[i].name?.message}
                                    />

                                    <ActionIcon size="xl" color="red" onClick={() => removePantone(i)}>
                                        <TrashIcon />
                                    </ActionIcon>
                                </Group>
                            ))}
                        </SimpleGrid>
                    </Grid.Col>

                    <Grid.Col>
                        <Button type="submit" size="sm" color="lime" variant="outline" uppercase fullWidth>
                            Aggiungi avviamento
                        </Button>
                    </Grid.Col>
                </Grid>
            </form>

            {pressFields.filter(p => p.run_type?.kind === 'offset').length > 0 && (
                <>
                    <Title order={2} my="lg">
                        Avviamenti
                    </Title>

                    <Table striped fontSize="lg">
                        <thead>
                            <tr>
                                <th>Tipo</th>
                                <th>Descrizione</th>
                                <th>Carta</th>
                                <th>Resa</th>
                                <th>Colore</th>
                                <th>Pantoni</th>
                                <th>Vernice</th>
                                <th className="action-1" />
                            </tr>
                        </thead>
                        <tbody>
                            {pressFields.map((p, i) => (
                                <Fragment key={p.id}>
                                    {p.run_type?.kind === 'offset' && (
                                        <tr>
                                            <td>{p.run_type?.name}</td>
                                            <td>{p.description}</td>
                                            <td>
                                                {p.paper?.name} {p.paper?.weight}gr {p.paper?.format} {p.paper?.orientation}
                                            </td>
                                            <td>{p.yield}</td>
                                            <td>{p.colors?.map(c => c.toUpperCase())}</td>
                                            <td>{p.pantones ? p.pantones.map(n => n.name).join(', ') : '-'}</td>
                                            <td>{p.varnish?.name ?? '-'}</td>
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

export default Step3;
