import { Controller, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiDelete, apiPost } from '@lib/api';
import { error, success } from '@lib/notification';

import { FetchResult, RunType } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Button, Select, Table, TextInput, Title } from '@mantine/core';

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
            <span className="text-xs font-semibold italic">* Campi obbligatori</span>

            <form noValidate className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex">
                    <TextInput label="Nome" size="xl" variant="filled" className="flex-grow" required {...register('name', { required: 'Il nome è obbligatorio' })} error={errors.name?.message} />

                    <Controller
                        name="kind"
                        control={control}
                        rules={{ required: 'Il tipo è obbligatorio' }}
                        render={({ field, fieldState }) => (
                            <Select label="Tipo" size="xl" variant="filled" className="ml-4" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} data={kind} />
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

            {runTypes && runTypes.data.length > 0 && (
                <>
                    <Title order={2} my="xl">
                        Tipi di avviamento presenti
                    </Title>

                    <Table striped fontSize="lg">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {runTypes?.data.map(k => (
                                <tr key={k.id}>
                                    <td className="px-4 py-2">{k.name}</td>
                                    <td className="px-4 py-2">{kind.find(x => x.value === k.kind)?.label}</td>
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
