import { Controller, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import Layout from '@components/_layout';

import { FetchResult, Field, FieldType } from 'types';

import { Button, Select, TextInput, Title } from '@mantine/core';

type Form = {
    name: string;
    type: string;
};

const Fields: React.FC = () => {
    const { data: fields } = useSWR<FetchResult<Field[]>>('/items/fields');

    const {
        handleSubmit,
        register,
        control,
        formState: { errors }
    } = useForm<Form>();

    const onSubmit = async (input: Form) => {
        console.log(input);
    };

    return (
        <Layout title="Campi della Commessa">
            <Title order={1}>Campi della Commessa</Title>

            <form className="mt-8 flex" onSubmit={handleSubmit(onSubmit)}>
                <TextInput label="Materiale" size="xl" variant="filled" required {...register('name', { required: 'Il nome è obbligatorio' })} error={errors.name?.message} />

                <Controller
                    name="type"
                    control={control}
                    rules={{ required: 'Il tipo è obbligatorio' }}
                    render={({ field, fieldState }) => (
                        <Select
                            label="Tipo"
                            size="xl"
                            variant="filled"
                            required
                            value={field.value}
                            onChange={field.onChange}
                            className="ml-2"
                            error={fieldState.error?.message}
                            data={Object.values(FieldType).map(f => ({ value: f, label: f }))}
                        />
                    )}
                />

                <Button type="submit" size="xl" color="blue">
                    Aggiungi
                </Button>
            </form>

            <table className="mt-8 w-full table-auto">
                <thead>
                    <tr>
                        <th className="px-4 py-2 text-left">Campo</th>
                        <th className="px-4 py-2 text-left">Tipo</th>
                        <th className="px-4 py-2 text-left">Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    {fields?.data.map(f => (
                        <tr key={f.id} className="odd:bg-slate-200 even:bg-slate-100">
                            <td className="px-4 py-2">{f.name} </td>
                            <td className="px-4 py-2">{f.type}</td>
                            <td className="px-4 py-2">
                                <Link to={`/fields/manage/${f.id}`}>Modifica</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    );
};

export default Fields;
