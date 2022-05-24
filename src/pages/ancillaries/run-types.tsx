import { Controller, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiDelete, apiPost } from '@lib/api';
import { error, success } from '@lib/notification';

import { FetchResult, RunType } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Button, Grid, Select, Table, TextInput, Title, Text } from '@mantine/core';

import { TrashIcon } from '@heroicons/react/outline';

const RunTypes: React.FC = () => {
    const url = '/items/run_type';

    const { data: runTypes } = useSWR<FetchResult<RunType[]>>(url);

    const kind = [
        { value: 'offset', label: 'Offset' },
        { value: 'digital', label: 'Digitale' }
    ];

    const {
        handleSubmit,
        register,
        control,
        reset,
        formState: { errors }
    } = useForm<RunType>();

    const { mutate } = useSWRConfig();

    const onSubmit = async (input: RunType) => {
        try {
            await mutate(url, apiPost(url, input));

            success('Tipo avviamento salvato con successo');
        } catch (e) {
            error(e);
        }
    };

    const removeRunType = async (id: number) => {
        if (confirm('Sei sicuro di voler eliminare questo tipo di avviamento?')) {
            try {
                await mutate(url, apiDelete(`${url}/${id}`));

                success('Tipo avviamento eliminato con successo');
            } catch (e) {
                error(e);
            }
        }
    };

    return (
        <Layout title="Tipi di avviamento">
            <Title order={1} mb="lg">
                Tipi di avviamento
            </Title>
            <Text size="sm" weight={500}>
                * Campi obbligatori
            </Text>

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Grid columns={24} mt="lg">
                    <Grid.Col span={20}>
                        <TextInput label="Nome" size="xl" required {...register('name', { required: 'Il nome è obbligatorio' })} error={errors.name?.message} />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Controller
                            name="kind"
                            control={control}
                            rules={{ required: 'Il tipo è obbligatorio' }}
                            render={({ field, fieldState }) => <Select label="Tipo" size="xl" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} data={kind} />}
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

            {runTypes && runTypes.data.length > 0 && (
                <>
                    <Title order={2} my="xl">
                        Tipi di avviamento presenti
                    </Title>

                    <Table striped fontSize="lg">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Tipo</th>
                                <th className="action-1" />
                            </tr>
                        </thead>
                        <tbody>
                            {runTypes?.data.map(k => (
                                <tr key={k.id}>
                                    <td>{k.name}</td>
                                    <td>{kind.find(x => x.value === k.kind)?.label}</td>
                                    <td>
                                        <ActionIcon color="red" size="lg" onClick={() => removeRunType(k.id as number)}>
                                            <TrashIcon />
                                        </ActionIcon>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}
        </Layout>
    );
};

export default RunTypes;
