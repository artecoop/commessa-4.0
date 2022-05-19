import { Controller, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, Press, FetchResult, Paper, RunType } from 'types';

import { ActionIcon, Button, NumberInput, Select, Switch, Table, TextInput, Title } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

type Form = {
    run_type: string;
    description: string;
    color: boolean;
    paper: string;
    yield: number;
    sheets: number;
};

const Step4: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: papers } = useSWR<FetchResult<Paper[]>>(['/items/paper', { sort: ['name'] }]);
    const { data: runTypes } = useSWR<FetchResult<RunType[]>>(['/items/run_type', { filter: { kind: 'digital' } }]);

    const {
        handleSubmit,
        register,
        control,
        formState: { errors }
    } = useForm<Form>();

    const { mutate } = useSWRConfig();

    const addDigitalPrint = (input: Form) => {
        if (contract && !contract.press) {
            contract.press = new Array<Press>();
        }

        const { run_type, paper, color, ...rest } = input;

        const parsed = {
            id: Math.round(Math.random() * 9999), //temporary
            run_type: runTypes?.data.find(r => r.id === +run_type),
            colors: color ? ['c', 'm', 'y', 'k'] : ['k'],
            paper: papers?.data.find(p => p.id === +paper),
            ...rest
        } as Press;

        contract?.press?.push(parsed);

        success("Avviamento aggiunto all'elenco");
    };

    const removeDigitalPrint = async (id: number) => {
        if (confirm('Sei sicuro di voler eliminare questo avviamento?')) {
            const index = contract?.press?.findIndex(p => p.id === id);
            if (index !== undefined && index > -1) {
                contract?.press?.splice(index, 1);

                success("Avviamento rimosso dall'elenco");
            }
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
                        name="run_type"
                        control={control}
                        rules={{ required: 'Il tipo di avviamento è obbligatorio' }}
                        render={({ field, fieldState }) => (
                            <Select
                                label="Avviamento"
                                size="xl"
                                variant="filled"
                                required
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                data={runTypes?.data.map(r => ({ value: r.id?.toString() || '', label: r.name })) ?? []}
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
                        name="yield"
                        control={control}
                        rules={{ required: 'La resa è obbligatoria' }}
                        render={({ field, fieldState }) => (
                            <NumberInput label="Resa" size="xl" variant="filled" className="ml-4" required min={1} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
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

            {contract?.press && contract.press.filter(p => p.run_type?.kind === 'digital').length > 0 && (
                <>
                    <Title order={2} className="my-4">
                        Avviamenti
                    </Title>

                    <Table striped fontSize="lg" mt="xl">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Descrizione</th>
                                <th className="px-4 py-2">Colori</th>
                                <th className="px-4 py-2">Carta</th>
                                <th className="px-4 py-2">Resa</th>
                                <th className="px-4 py-2">Fogli</th>
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.press
                                ?.filter(p => p.run_type?.kind === 'digital')
                                ?.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2">{p.run_type.name}</td>
                                        <td className="px-4 py-2">{p.description}</td>
                                        <td className="px-4 py-2">{p.colors.length > 1 ? 'SI' : 'NO'}</td>
                                        <td className="px-4 py-2">{p.paper.name}</td>
                                        <td className="px-4 py-2">{p.yield}</td>
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
