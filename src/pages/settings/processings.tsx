import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Processing } from 'types';

export const ProcessingsView: React.FC = () => {
    const [processings, setProcessings] = useState<Processing[]>(JSON.parse(sessionStorage.getItem('processings') ?? '[]'));

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<Processing>();

    const onSubmit = async (input: Processing) => {
        const tmp = [...(processings ?? [])];
        const newId =
            processings
                ?.map(f => f.id)
                .sort((a, b) => a - b)
                .pop() ?? 0;

        tmp.push({ id: newId + 1, name: input.name });

        setProcessings(tmp);

        sessionStorage.setItem('processings', JSON.stringify(tmp));
    };

    return (
        <>
            <h3 className="mt-4 mb-8">Lavorazioni</h3>

            {processings?.map(f => (
                <div key={f.id}>
                    {f.id}: {f.name}
                </div>
            ))}

            <hr className="my-8" />

            <form className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                <input type="text" {...register('name', { required: true })} />
                {errors.name && 'Il nome è obbligatorio'}

                <button type="submit" className="button green ml-4">
                    Aggiungi
                </button>
            </form>
        </>
    );
};
