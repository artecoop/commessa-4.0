import { useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiDelete, apiPost } from '@lib/api';
import { error, success } from '@lib/notification';

import { FetchResult, ProcessDefinition } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Button, Grid, Switch, Table, TextInput, Title, Text } from '@mantine/core';

import { TrashIcon } from '@heroicons/react/outline';

const Processings: React.FC = () => {
    const url = '/items/process_definition';

    const { data: processings } = useSWR<FetchResult<ProcessDefinition[]>>(url);

    const {
        handleSubmit,
        register,
        reset,
        formState: { errors }
    } = useForm<ProcessDefinition>();

    const { mutate } = useSWRConfig();

    const onSubmit = async (input: ProcessDefinition) => {
        try {
            await mutate(url, apiPost(url, input));

            success('Lavorazione salvata con successo');
        } catch (e) {
            error(e);
        }
    };

    const removeProcessing = async (id: number) => {
        if (confirm('Sei sicuro di voler eliminare questa lavorazione?')) {
            try {
                await mutate(url, apiDelete(`${url}/${id}`));

                success('Lavorazione eliminata con successo');
            } catch (e) {
                error(e);
            }
        }
    };

    return (
        <Layout title="Lavorazioni">
            <Title order={1} mb="lg">
                Lavorazioni
            </Title>
            <Text size="sm" weight={500}>
                * Campi obbligatori
            </Text>

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Grid justify="center" align="center" mt="lg">
                    <Grid.Col span={9}>
                        <TextInput label="Nome" size="xl" variant="filled" required {...register('name', { required: 'Il nome è obbligatorio' })} error={errors.name?.message} />
                    </Grid.Col>

                    <Grid.Col span={1}>
                        <Switch label="Pre" size="xl" {...register('pre')} defaultChecked={false} />
                    </Grid.Col>

                    <Grid.Col span={2}>
                        <Switch label="Deriva da avviamento" size="xl" {...register('special')} defaultChecked={false} />
                    </Grid.Col>

                    <Grid.Col span={11}>
                        <Button type="submit" size="xl" uppercase fullWidth>
                            Salva
                        </Button>
                    </Grid.Col>

                    <Grid.Col span={1}>
                        <Button size="xl" uppercase color="red" fullWidth onClick={() => reset()}>
                            Reset
                        </Button>
                    </Grid.Col>
                </Grid>
            </form>

            {processings && processings.data.length > 0 && (
                <>
                    <Title order={2} my="xl">
                        Lavorazioni presenti
                    </Title>

                    <Table striped fontSize="lg">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Pre</th>
                                <th>Deriva da avviamento</th>
                                <th className="action-1" />
                            </tr>
                        </thead>
                        <tbody>
                            {processings?.data.map(p => (
                                <tr key={p.id}>
                                    <td>{p.name}</td>
                                    <td>{p.pre ? 'SI' : 'NO'}</td>
                                    <td>{p.special ? 'SI' : 'NO'}</td>
                                    <td>
                                        <ActionIcon color="red" size="lg" onClick={() => removeProcessing(p.id as number)}>
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

export default Processings;
