import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, FetchResult, OffsetPrint, Paper } from 'types';
import { offsetRunTypes, varnishTypes } from 'values';

import { ActionIcon, Button, Checkbox, CheckboxGroup, NumberInput, Select, Table, TextInput, Title } from '@mantine/core';

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

        success("Avviamento aggiunto all'elenco");
    };

    const removeOffsetPrint = async (id: number) => {
        const index = contract?.offset_prints?.findIndex(op => op.id === id);
        if (index !== undefined && index > -1) {
            contract?.offset_prints?.splice(index, 1);
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

            <form noValidate className="mt-8" onSubmit={handleSubmit(addOffsetPrint)}>
                <div className="flex justify-between">
                    <Controller
                        name="run_type"
                        control={control}
                        rules={{ required: 'Il tipo di avviamento è obbligatorio' }}
                        render={({ field, fieldState }) => (
                            <Select label="Avviamento" size="xl" variant="filled" required value={field.value} onChange={field.onChange} error={fieldState.error?.message} data={offsetRunTypes} />
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
                            <NumberInput label="Resa" size="xl" variant="filled" className="ml-4" required min={1} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
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
                        render={({ field }) => <Select label="Vernice" size="xl" variant="filled" className="ml-4" value={field.value} onChange={field.onChange} data={varnishTypes} />}
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

                <div className="mt-4">
                    <Button type="submit" size="md" uppercase variant="outline" className="w-full">
                        Aggiungi avviamento
                    </Button>
                </div>
            </form>

            {contract?.offset_prints && contract.offset_prints.length > 0 && (
                <>
                    <Title order={1} className="my-4">
                        Avviamenti
                    </Title>
                    <Table striped>
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Carta</th>
                                <th className="px-4 py-2">Resa</th>
                                <th className="px-4 py-2">Colore</th>
                                <th className="px-4 py-2">Pantoni</th>
                                <th className="px-4 py-2">Vernice</th>
                                <th className="w-16" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.offset_prints?.map(p => (
                                <tr key={p.id}>
                                    <td className="px-4 py-2">{offsetRunTypes.find(r => r.value === p.run_type)?.label}</td>
                                    <td className="px-4 py-2">{papers?.data.find(d => d.id === p.paper)?.name}</td>
                                    <td className="px-4 py-2">{p.yield}</td>
                                    <td className="px-4 py-2">{p.colors?.map(c => c.toUpperCase())}</td>
                                    <td className="px-4 py-2">{p.pantones ? p.pantones.map(n => n.name).join(', ') : '-'}</td>
                                    <td className="px-4 py-2">{p.varnish ? (p.varnish === 'fulltable' ? 'Tavola piena' : 'Riserva') : '-'}</td>
                                    <td>
                                        <ActionIcon color="red" size="lg" onClick={() => removeOffsetPrint(p.id as number)}>
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

export default Step3;
