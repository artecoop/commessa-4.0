import { Controller, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiDelete, apiPost } from '@lib/api';
import { error, success } from '@lib/notification';

import { FetchResult, Paper } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Button, Grid, NumberInput, Select, Table, TextInput, Title, Text } from '@mantine/core';

import { TrashIcon } from '@heroicons/react/outline';

const Papers: React.FC = () => {
    const url = '/items/paper';
    const key = [url, { sort: ['name'] }];

    const { data: papers } = useSWR<FetchResult<Paper[]>>(key);

    const {
        handleSubmit,
        register,
        control,
        reset,
        formState: { errors }
    } = useForm<Paper>();

    const { mutate } = useSWRConfig();

    const onSubmit = async (input: Paper) => {
        try {
            await mutate(key, apiPost(url, input));
            reset();

            success('Carta salvata con successo');
        } catch (e) {
            error(e);
        }
    };

    const removePaper = async (id: number) => {
        if (confirm('Sei sicuro di voler eliminare questa carta?')) {
            try {
                await mutate(key, apiDelete(`${url}/${id}`));

                success('Carta eliminata con successo');
            } catch (e) {
                error(e);
            }
        }
    };

    return (
        <Layout title="Carta">
            <Title order={1} mb="lg">
                Carta
            </Title>
            <Text size="sm" weight={500}>
                * Campi obbligatori
            </Text>

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Grid mt="lg" columns={24}>
                    <Grid.Col span={12}>
                        <TextInput label="Carta" size="xl" required {...register('name', { required: 'Il nome è obbligatorio' })} error={errors.name?.message} />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Controller
                            name="weight"
                            control={control}
                            rules={{ required: 'La grammatura è obbligatoria' }}
                            render={({ field, fieldState }) => (
                                <NumberInput label="Grammatura" size="xl" required min={0} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <TextInput label="Formato" size="xl" required {...register('format', { required: 'Il formato è obbligatorio' })} error={errors.format?.message} />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Controller
                            name="orientation"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Orientamento"
                                    size="xl"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                    data={[
                                        { value: 'long', label: 'Lato lungo' },
                                        { value: 'short', label: 'Lato corto' }
                                    ]}
                                />
                            )}
                        />
                    </Grid.Col>

                    <Grid.Col span={21}>
                        <Button type="submit" size="xl" uppercase fullWidth>
                            Salva
                        </Button>
                    </Grid.Col>

                    <Grid.Col span={3}>
                        <Button size="xl" uppercase color="red" fullWidth onClick={() => reset()}>
                            Reset
                        </Button>
                    </Grid.Col>
                </Grid>
            </form>

            <Title order={2} mt="xl">
                Carte presenti
            </Title>

            {papers?.data && papers.data.length > 0 && (
                <Table striped fontSize="lg">
                    <thead>
                        <tr>
                            <th>Carta</th>
                            <th>Peso</th>
                            <th>Formato</th>
                            <th>Orientamento</th>
                            <th className="action-1" />
                        </tr>
                    </thead>
                    <tbody>
                        {papers.data.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.weight}gr</td>
                                <td>{p.format}</td>
                                <td>{p.orientation ? (p.orientation === 'long' ? 'Lato lungo' : 'Lato corto') : '-'}</td>
                                <td>
                                    <ActionIcon color="red" size="lg" onClick={() => removePaper(p.id as number)}>
                                        <TrashIcon />
                                    </ActionIcon>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Layout>
    );
};

export default Papers;
