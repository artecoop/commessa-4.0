import { useForm } from 'react-hook-form';

import { Press, Processing } from 'types';

import { Box, Button, Table, Textarea, Title } from '@mantine/core';

type Props = {
    processing: Processing | Press;
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
                <Box mb="md">
                    <Title order={3} mb="md">
                        Note presenti
                    </Title>

                    <Table striped>
                        <tbody>
                            {props.processing.notes.map((n, i) => (
                                <tr key={i}>
                                    <td>{n.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Box>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <Textarea label="Aggiungi nota" size="xl" required {...register('description', { required: 'La nota è obbligatoria' })} error={errors.description?.message} />

                <Button type="submit" size="xl" uppercase fullWidth mt="lg">
                    Salva
                </Button>
            </form>
        </>
    );
};

export default Notes;
