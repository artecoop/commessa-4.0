import { Controller, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiDelete, apiPost } from '@lib/api';
import { error, success } from '@lib/notification';

import { FetchResult, Paper } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Button, NumberInput, Select, Table, TextInput, Title } from '@mantine/core';

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
            <span className="text-xs font-semibold italic">* Campi obbligatori</span>

            <form noValidate className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex">
                    <TextInput label="Carta" size="xl" variant="filled" className="flex-grow" required {...register('name', { required: 'Il nome è obbligatorio' })} error={errors.name?.message} />

                    <Controller
                        name="weight"
                        control={control}
                        rules={{ required: 'Le ore preventivate sono obbligatorie' }}
                        render={({ field, fieldState }) => (
                            <NumberInput
                                label="Grammatura"
                                size="xl"
                                variant="filled"
                                className="ml-4"
                                required
                                min={0}
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    <TextInput label="Formato" size="xl" variant="filled" className="ml-4" required {...register('format', { required: 'Il formato è obbligatorio' })} error={errors.format?.message} />

                    <Controller
                        name="orientation"
                        control={control}
                        render={({ field, fieldState }) => (
                            <Select
                                label="Orientamento"
                                size="xl"
                                variant="filled"
                                className="ml-4"
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
                </div>

                <div className="mt-4 flex">
                    <Button type="submit" size="xl" uppercase variant="outline" className="flex-grow">
                        Salva
                    </Button>
                    <Button variant="outline" size="xl" uppercase color="red" className="ml-4 w-36" onClick={() => reset()}>
                        Reset
                    </Button>
                </div>
            </form>

            <Title order={2} mt="xl">
                Carte presenti
            </Title>

            <Table striped fontSize="lg">
                <thead>
                    <tr>
                        <th className="px-4 py-2">Carta</th>
                        <th className="px-4 py-2">Peso</th>
                        <th className="px-4 py-2">Formato</th>
                        <th className="px-4 py-2">Orientamento</th>
                        <th className="w-16" />
                    </tr>
                </thead>
                <tbody>
                    {papers?.data.map(p => (
                        <tr key={p.id}>
                            <td className="px-4 py-2">{p.name}</td>
                            <td className="px-4 py-2">{p.weight}gr</td>
                            <td className="px-4 py-2">{p.format}</td>
                            <td className="px-4 py-2">{p.orientation ? (p.orientation === 'long' ? 'Lato lungo' : 'Lato corto') : '-'}</td>
                            <td>
                                <ActionIcon color="red" size="lg" onClick={() => removePaper(p.id as number)}>
                                    <TrashIcon />
                                </ActionIcon>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Layout>
    );
};

export default Papers;
