import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';
import { showNotification } from '@mantine/notifications';

import fetchData from '@lib/api';

import { Contract, FetchResult, OffsetPrint, Paper } from 'types';

import { ActionIcon, Button, Checkbox, CheckboxGroup, NumberInput, Select, TextInput, Title } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

const Step3: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: papers } = useSWR<FetchResult<Paper[]>>(['/items/paper', { sort: ['name'] }]);

    const {
        handleSubmit,
        register,
        control,
        reset,
        formState: { errors }
    } = useForm<OffsetPrint>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'pantones'
    });

    const { mutate } = useSWRConfig();

    const addOffsetPrint = (input: OffsetPrint) => {
        input.paper = +input.paper;

        if (contract && !contract.offset_prints) {
            contract.offset_prints = new Array<OffsetPrint>();
        }

        contract?.offset_prints?.push(input);

        showNotification({ message: "Avviamento aggiunto all'elenco", color: 'green' });
    };

    const removeOffsetPrint = async (id: number) => {
        const index = contract?.offset_prints?.findIndex(op => op.id === id);
        if (index !== undefined && index > -1) {
            contract?.offset_prints?.splice(index, 1);
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

            <form noValidate className="mt-8" onSubmit={handleSubmit(addOffsetPrint)}>
                <div className="flex justify-between">
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
                                data={[
                                    { value: 'b', label: 'B' },
                                    { value: 'bv', label: 'B+V' },
                                    { value: 'bv12', label: 'B/V Giro 12' },
                                    { value: 'bv16', label: 'B/V Giro 16' }
                                ]}
                            />
                        )}
                    />

                    <Controller
                        name="paper"
                        control={control}
                        rules={{ required: 'La carta è obbligatoria' }}
                        render={({ field, fieldState }) => (
                            <Select
                                label="Carta"
                                size="xl"
                                variant="filled"
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
                            <NumberInput label="Resa" size="xl" variant="filled" className="ml-4" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
                        )}
                    />

                    <Controller
                        name="colors"
                        control={control}
                        render={({ field }) => (
                            <CheckboxGroup size="xl" label="Colori" value={field.value} onChange={field.onChange} className="ml-4">
                                <Checkbox value="c" label="Cyan" />
                                <Checkbox value="m" label="Magenta" />
                                <Checkbox value="y" label="Giallo" />
                                <Checkbox value="k" label="Nero" />
                            </CheckboxGroup>
                        )}
                    />

                    <Controller
                        name="varnish"
                        control={control}
                        render={({ field }) => (
                            <Select
                                label="Vernice"
                                size="xl"
                                variant="filled"
                                className="ml-4"
                                value={field.value}
                                onChange={field.onChange}
                                data={[
                                    { value: 'fulltable', label: 'Tavola piena' },
                                    { value: 'reserve', label: 'Riserva' }
                                ]}
                            />
                        )}
                    />
                </div>

                <div className="mt-8 flex">
                    <div className="flex items-center">
                        <Button leftIcon={<PlusIcon className="icon-field-left" />} variant="outline" color="green" uppercase onClick={() => append({})}>
                            Aggiungi Pantone
                        </Button>
                    </div>

                    {fields.map((v, i) => (
                        <div key={v.id} className="mb-4 flex items-end">
                            <TextInput
                                label="Pantone"
                                size="xl"
                                variant="filled"
                                className="ml-4 flex-grow"
                                required
                                {...register(`pantones.${i}.name` as const, { required: 'Il pantone è obbligatorio se aggiunto' })}
                                error={errors.pantones?.[i].name?.message}
                            />

                            <ActionIcon variant="outline" size="xl" color="red" className="ml-2 mb-2" onClick={() => remove(i)}>
                                <TrashIcon />
                            </ActionIcon>
                        </div>
                    ))}
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

            {contract?.offset_prints && contract.offset_prints.length > 0 && (
                <>
                    <Title order={1} className="my-4">
                        Avviamenti
                    </Title>
                    <table className="w-full table-auto">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Tipo</th>
                                <th className="px-4 py-2 text-left">Carta</th>
                                <th className="px-4 py-2 text-left">Resa</th>
                                <th className="px-4 py-2 text-left">Colore</th>
                                <th className="px-4 py-2 text-left">Pantoni</th>
                                <th className="px-4 py-2 text-left">Vernice</th>
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.offset_prints?.map(p => (
                                <tr key={p.id} className="bg-slate-100 even:bg-slate-200">
                                    <td className="px-4 py-2 text-left">{p.run_type}</td>
                                    <td className="px-4 py-2 text-left">{papers?.data.find(d => d.id === p.paper)?.name}</td>
                                    <td className="px-4 py-2 text-left">{p.yield}</td>
                                    <td className="px-4 py-2 text-left">{p.colors?.map(c => c.toUpperCase())}</td>
                                    <td className="px-4 py-2 text-left">{p.pantones ? p.pantones.map(n => n.name).join(', ') : '-'}</td>
                                    <td className="px-4 py-2 text-left">{p.varnish ? (p.varnish === 'fulltable' ? 'Tavola piena' : 'Riserva') : '-'}</td>
                                    <td>
                                        <ActionIcon color="red" size="lg" onClick={() => removeOffsetPrint(p.id as number)}>
                                            <TrashIcon />
                                        </ActionIcon>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>{' '}
                </>
            )}
        </>
    );
};

export default Step3;
