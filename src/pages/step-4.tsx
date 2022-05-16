import { Controller, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, DigitalPrint, FetchResult, Paper } from 'types';
import { digitalRunTypes } from 'values';

import { ActionIcon, Button, NumberInput, Select, Switch, Table, TextInput, Title } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

const Step4: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: papers } = useSWR<FetchResult<Paper[]>>(['/items/paper', { sort: ['name'] }]);

    const {
        handleSubmit,
        register,
        control,
        formState: { errors }
    } = useForm<DigitalPrint>();

    const { mutate } = useSWRConfig();

    const addDigitalPrint = (input: DigitalPrint) => {
        input.paper = +input.paper;

        if (contract && !contract.digital_prints) {
            contract.digital_prints = new Array<DigitalPrint>();
        }

        contract?.digital_prints?.push(input);

        success("Avviamento aggiunto all'elenco");
    };

    const removeDigitalPrint = async (id: number) => {
        const index = contract?.digital_prints?.findIndex(op => op.id === id);
        if (index !== undefined && index > -1) {
            contract?.digital_prints?.splice(index, 1);

            success("Avviamento rimosso all'elenco");
        }
    };

    const save = async () => {
        const url = `/items/contracts/${contract?.id}`;

        try {
            await mutate<FetchResult<Contract>>([url, queryFields], apiPatch(url, contract));

            success('Avviamenti salvati con successo');
        } catch (e) {
            error(e);
        }
    };

    return (
        <>
            <span className="text-xs font-semibold italic">* Campi obbligatori</span>

            <form noValidate className="mt-8 flex" onSubmit={handleSubmit(addDigitalPrint)}>
                <div className="flex flex-grow">
                    <Controller
                        name="kind"
                        control={control}
                        rules={{ required: 'Il tipo è obbligatorio' }}
                        render={({ field, fieldState }) => (
                            <Select
                                label="Tipo"
                                size="xl"
                                variant="filled"
                                required
                                value={field.value?.toString()}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                data={digitalRunTypes}
                            />
                        )}
                    />

                    <TextInput
                        label="Descrizione"
                        size="xl"
                        variant="filled"
                        className="ml-4 flex-grow"
                        required
                        {...register('description', { required: 'La descrizione è obbligatoria' })}
                        error={errors.description?.message}
                    />

                    <div className="ml-4 flex items-end pb-4">
                        <Switch label="Colori" size="xl" {...register('color')} defaultChecked={true} />
                    </div>

                    <Controller
                        name="paper"
                        control={control}
                        rules={{ required: 'La carta è obbligatoria' }}
                        render={({ field, fieldState }) => (
                            <Select
                                label="Carta"
                                size="xl"
                                variant="filled"
                                className="ml-4"
                                required
                                value={field.value?.toString()}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                data={papers?.data.map(p => ({ value: p.id?.toString() || '', label: p.name })) || []}
                            />
                        )}
                    />

                    <Controller
                        name="sheets"
                        control={control}
                        rules={{ required: 'I fogli sono obbligatori' }}
                        render={({ field, fieldState }) => (
                            <NumberInput label="Fogli" size="xl" variant="filled" className="ml-4" required min={1} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                        )}
                    />
                </div>

                <div className="ml-8 flex items-end pb-2">
                    <ActionIcon size="xl" color="blue" variant="outline" type="submit">
                        <PlusIcon />
                    </ActionIcon>
                </div>
            </form>

            {contract?.digital_prints && contract.digital_prints.length > 0 && (
                <>
                    <Title order={1} className="my-4">
                        Avviamenti
                    </Title>

                    <Table striped mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Descrizione</th>
                                <th className="px-4 py-2">Colori</th>
                                <th className="px-4 py-2">Carta</th>
                                <th className="px-4 py-2">Fogli</th>
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.digital_prints?.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-2">{digitalRunTypes.find(r => r.value === p.kind)?.label}</td>
                                    <td className="px-4 py-2">{p.description}</td>
                                    <td className="px-4 py-2">{p.color ? 'SI' : 'NO'}</td>
                                    <td className="px-4 py-2">{papers?.data.find(d => d.id === p.paper)?.name}</td>
                                    <td className="px-4 py-2">{p.sheets}</td>
                                    <td>
                                        <ActionIcon color="red" size="lg" onClick={() => removeDigitalPrint(p.id as number)}>
                                            <TrashIcon />
                                        </ActionIcon>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Button variant="outline" size="xl" uppercase color="lime" className="mt-8 w-full" onClick={() => save()}>
                        Salva
                    </Button>
                </>
            )}
        </>
    );
};

export default Step4;
