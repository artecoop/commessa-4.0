import { useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiDelete, apiPost } from '@lib/api';
import { error, success } from '@lib/notification';

import { FetchResult, ProcessDefinition } from 'types';

import Layout from '@components/_layout';

import { ActionIcon, Button, Switch, Table, TextInput, Title } from '@mantine/core';

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
            <span className="text-xs font-semibold italic">* Campi obbligatori</span>

            <form noValidate className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                <div className="flex">
                    <TextInput label="Nome" size="xl" variant="filled" className="flex-grow" required {...register('name', { required: 'Il nome è obbligatorio' })} error={errors.name?.message} />

                    <div className="ml-4 flex items-center">
                        <Switch label="Pre" size="xl" {...register('pre')} defaultChecked={false} />
                    </div>
                    <div className="ml-4 flex items-center">
                        <Switch label="Deriva da avviamento" size="xl" {...register('special')} defaultChecked={false} />
                    </div>
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

            {processings && processings.data.length > 0 && (
                <>
                    <Title order={2} my="xl">
                        Lavorazioni presenti
                    </Title>

                    <Table striped>
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Nome</th>
                                <th className="px-4 py-2">Pre</th>
                                <th className="px-4 py-2">Deriva da avviamento</th>
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {processings?.data.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-2">{p.name}</td>
                                    <td className="px-4 py-2">{p.pre ? 'SI' : 'NO'}</td>
                                    <td className="px-4 py-2">{p.special ? 'SI' : 'NO'}</td>
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
