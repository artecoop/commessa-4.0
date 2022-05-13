import { Controller, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';
import { showNotification } from '@mantine/notifications';

import fetchData from '@lib/api';

import { Contract, FetchResult, Paper } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Button, NumberInput, Select, TextInput, Title } from '@mantine/core';

import { TrashIcon } from '@heroicons/react/outline';

const Papers: React.FC = () => {
    const url = '/items/paper';
    const { data: papers } = useSWR<FetchResult<Paper[]>>([url, { sort: ['name'] }]);

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
            await mutate<FetchResult<Contract>>(url, fetchData(url, input, 'POST'));

            showNotification({ message: 'Carta salvata con successo', color: 'green' });
        } catch (e) {
            const error = e as Error;
            showNotification({ message: error.message, color: 'red' });
        }
    };

    const remove = async (id: number) => {
        try {
            await mutate<FetchResult<Contract>>(url, fetchData(`${url}/${id}`, undefined, 'DELETE'));

            showNotification({ message: 'Carta eliminata con successo', color: 'green' });
        } catch (e) {
            const error = e as Error;
            showNotification({ message: error.message, color: 'red' });
        }
    };

    return (
        <Layout title="Campi della Commessa">
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
                            <NumberInput label="Grammatura" size="xl" variant="filled" className="ml-4" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
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

            <Title order={2}  className="my-4">
                Carte presenti
            </Title>

            <table className="w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-left">Carta</th>
                        <th className="px-4 py-2 text-left">Peso</th>
                        <th className="px-4 py-2 text-left">Formato</th>
                        <th className="px-4 py-2 text-left">Orientamento</th>
                        <th className="w-16" />
                    </tr>
                </thead>
                <tbody>
                    {papers?.data.map(p => (
                        <tr key={p.id} className="bg-slate-100 even:bg-slate-200">
                            <td className="px-4 py-2 text-left">{p.name}</td>
                            <td className="px-4 py-2 text-left">{p.weight}gr</td>
                            <td className="px-4 py-2 text-left">{p.format}</td>
                            <td className="px-4 py-2 text-left">{p.orientation ? (p.orientation === 'long' ? 'Lato lungo' : 'Lato corto') : '-'}</td>
                            <td>
                                <ActionIcon color="red" size="lg" onClick={() => remove(p.id as number)}>
                                    <TrashIcon />
                                </ActionIcon>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    );
};

export default Papers;
