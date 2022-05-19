import { useForm } from 'react-hook-form';

import { Processing } from 'types';

import { Button, Textarea, Title } from '@mantine/core';

type Props = {
    processing: Processing;
    onSave(): void;
};

type Note = {
    description: string;
};

export const Notes: React.FC<Props> = (props: Props) => {
    const {
        handleSubmit,
        register,

        formState: { errors }
    } = useForm<Note>();

    const onSubmit = async (input: Note) => {
        if (!props.processing.notes) {
            props.processing.notes = new Array<Note>();
        }

        props.processing.notes.push(input);

        props.onSave();
    };

    return (
        <>
            {props.processing.notes && props.processing.notes.length > 0 && (
                <div className="mb-4">
                    <Title order={3} mb="md">
                        Note presenti
                    </Title>

                    {props.processing.notes.map((n, i) => (
                        <div key={i} className="even:bg-blue-100 px-4 py-2">
                            {n.description}
                        </div>
                    ))}
                </div>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Textarea label="Aggiungi nota" size="xl" variant="filled" required {...register('description', { required: 'La nota è obbligatoria' })} error={errors.description?.message} />

                <Button type="submit" size="xl" uppercase variant="outline" className="mt-4 w-full">
                    Salva
                </Button>
            </form>
        </>
    );
};

export default Notes;
