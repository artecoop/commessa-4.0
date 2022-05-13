import { Controller, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';
import { showNotification } from '@mantine/notifications';

import fetchData from '@lib/api';

import { Contract, DigitalPrint, FetchResult, Paper } from 'types';

import { ActionIcon, Button, NumberInput, Select, Switch, TextInput, Title } from '@mantine/core';

import { TrashIcon } from '@heroicons/react/outline';

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
        reset,
        formState: { errors }
    } = useForm<DigitalPrint>();

    const { mutate } = useSWRConfig();

    const addDigitalPrint = (input: DigitalPrint) => {
        input.paper = +input.paper;

        if (contract && !contract.digital_prints) {
            contract.digital_prints = new Array<DigitalPrint>();
        }

        contract?.digital_prints?.push(input);

        showNotification({ message: "Avviamento aggiunto all'elenco", color: 'green' });
    };

    const removeDigitalPrint = async (id: number) => {
        const index = contract?.digital_prints?.findIndex(op => op.id === id);
        if (index !== undefined && index > -1) {
            contract?.digital_prints?.splice(index, 1);
            showNotification({ message: "Avviamento rimosso all'elenco", color: 'green' });
        }
    };

    const save = async () => {
        const url = `/items/contracts/${contract?.id}`;

        try {
            await mutate<FetchResult<Contract>>([url, queryFields], fetchData(url, contract, 'PATCH'));

            showNotification({ message: 'Avviamenti salvati con successo', color: 'green' });
        } catch (e) {
            const error = e as Error;
            showNotification({ message: error.message, color: 'red' });
        }
    };

    return (
        <>
            <span className="text-xs font-semibold italic">* Campi obbligatori</span>

            <form noValidate className="mt-8" onSubmit={handleSubmit(addDigitalPrint)}>
                <div className="flex">
                    <TextInput
                        label="Descrizione"
                        size="xl"
                        variant="filled"
                        className="flex-grow"
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
                            <NumberInput label="Fogli" size="xl" variant="filled" className="ml-4" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                        )}
                    />
                </div>

                <div className="mt-4 flex">
                    <Button type="submit" size="xl" uppercase variant="outline" className="flex-grow">
                        Aggiungi
                    </Button>
                    <Button variant="outline" size="xl" uppercase color="red" className="ml-4 w-36" onClick={() => reset(contract)}>
                        Reset
                    </Button>
                    <Button variant="outline" size="xl" uppercase color="lime" className="ml-4 w-36" onClick={() => save()}>
                        Salva
                    </Button>
                </div>
            </form>

            {contract?.digital_prints && contract.digital_prints.length > 0 && (
                <>
                    <Title order={1} className="my-4">
                        Avviamenti
                    </Title>

                    <table className="w-full table-auto">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Descrizione</th>
                                <th className="px-4 py-2 text-left">Colori</th>
                                <th className="px-4 py-2 text-left">Carta</th>
                                <th className="px-4 py-2 text-left">Fogli</th>
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.digital_prints?.map(p => (
                                <tr key={p.id} className="bg-slate-100 even:bg-slate-200">
                                    <td className="px-4 py-2 text-left">{p.description}</td>
                                    <td className="px-4 py-2 text-left">{p.color ? 'SI' : 'NO'}</td>
                                    <td className="px-4 py-2 text-left">{papers?.data.find(d => d.id === p.paper)?.name}</td>
                                    <td className="px-4 py-2 text-left">{p.sheets}</td>
                                    <td>
                                        <ActionIcon color="red" size="lg" onClick={() => removeDigitalPrint(p.id as number)}>
                                            <TrashIcon />
                                        </ActionIcon>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
};

export default Step4;
