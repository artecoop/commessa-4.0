import { useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiDelete, apiPost } from '@lib/api';
import { error, success } from '@lib/notification';

import { FetchResult, Varnish } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Button, Grid, Switch, Table, TextInput, Title, Text } from '@mantine/core';

import { TrashIcon } from '@heroicons/react/outline';

const VarnishView: React.FC = () => {
    const url = '/items/varnish';

    const { data: processings } = useSWR<FetchResult<Varnish[]>>(url);

    const {
        handleSubmit,
        register,
        reset,
        formState: { errors }
    } = useForm<Varnish>();

    const { mutate } = useSWRConfig();

    const onSubmit = async (input: Varnish) => {
        try {
            await mutate(url, apiPost(url, input));

            success('Vernice salvata con successo');
        } catch (e) {
            error(e);
        }
    };

    const removeProcessing = async (id: number) => {
        if (confirm('Sei sicuro di voler eliminare questa lavorazione?')) {
            try {
                await mutate(url, apiDelete(`${url}/${id}`));

                success('Vernice eliminata con successo');
            } catch (e) {
                error(e);
            }
        }
    };

    return (
        <Layout title="Verniciatura">
            <Title order={1} mb="lg">
                Verniciatura
            </Title>
            <Text size="sm" weight={500}>
                * Campi obbligatori
            </Text>

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Grid mt="lg" align="end" grow>
                    <Grid.Col span={10}>
                        <TextInput label="Nome" size="xl" variant="filled" required {...register('name', { required: 'Il nome è obbligatorio' })} error={errors.name?.message} />
                    </Grid.Col>

                    <Grid.Col span={1} pb="lg">
                        <Switch label="Aggiunge lastra?" size="xl" {...register('add_plate')} defaultChecked={false} />
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
                        Verniciature presenti
                    </Title>

                    <Table striped fontSize="lg">
                        <thead>
                            <tr>
                                <th style={{ width: '200px' }}>Aggiunge lastra?</th>
                                <th>Nome</th>
                                <th className="action-1" />
                            </tr>
                        </thead>
                        <tbody>
                            {processings?.data.map(p => (
                                <tr key={p.id}>
                                    <td>{p.add_plate ? 'SI' : 'NO'}</td>
                                    <td>{p.name}</td>
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

export default VarnishView;
