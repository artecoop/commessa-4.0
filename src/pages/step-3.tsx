import { Controller, useFieldArray, useForm } from 'react-hook-form';
import useSWR, { useSWRConfig } from 'swr';

import { apiPatch } from '@lib/api';
import { error, success } from '@lib/notification';

import { Contract, FetchResult, Press, Paper, Varnish, RunType } from 'types';

import { ActionIcon, Button, Checkbox, CheckboxGroup, NumberInput, Select, Table, TextInput, Title } from '@mantine/core';

import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

type Props = {
    contract?: Contract;
    queryFields: unknown;
};

type Form = Omit<Press, 'run_type' | 'paper' | 'varnish'> & {
    run_type: string;
    paper: string;
    varnish: string;
};

const Step3: React.FC<Props> = ({ contract, queryFields }: Props) => {
    const { data: papers } = useSWR<FetchResult<Paper[]>>(['/items/paper', { sort: ['name'] }]);
    const { data: runTypes } = useSWR<FetchResult<RunType[]>>(['/items/run_type', { filter: { kind: 'offset' } }]);
    const { data: varnishes } = useSWR<FetchResult<Varnish[]>>('/items/varnish');

    const {
        handleSubmit,
        register,
        control,
        formState: { errors }
    } = useForm<Form>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'pantones'
    });

    const removePantone = (i: number) => {
        if (confirm('Sei sicuro di voler eliminare questo pantone?')) {
            remove(i);
        }
    };

    const { mutate } = useSWRConfig();

    const addOffsetPrint = (input: Form) => {
        const { run_type, paper, varnish, ...rest } = input;

        const parsed = {
            id: Math.round(Math.random() * 9999), //temporary
            run_type: runTypes?.data.find(r => r.id === +run_type),
            paper: papers?.data.find(p => p.id === +paper),
            varnish: varnishes?.data.find(v => v.id === +varnish),
            ...rest
        } as Press;

        if (contract && !contract.press) {
            contract.press = new Array<Press>();
        }

        contract?.press?.push(parsed);

        success("Avviamento aggiunto all'elenco");
    };

    const removeOffsetPrint = async (id: number) => {
        if (confirm('Sei sicuro di voler eliminare questo avviamento?')) {
            const index = contract?.press?.findIndex(p => p.id === id);
            if (index !== undefined && index > -1) {
                contract?.press?.splice(index, 1);
                success("Avviamento rimosso all'elenco");
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

            <form noValidate className="mt-8" onSubmit={handleSubmit(addOffsetPrint)}>
                <div className="flex">
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

                    <TextInput label="Descrizione" size="xl" variant="filled" className="ml-4 flex-grow" {...register('description')} />

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
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                                data={papers?.data.map(p => ({ value: p.id?.toString() || '', label: `${p.name} ${p.weight}gr ${p.format} ${p.orientation ?? ''}` })) || []}
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
                </div>

                <div className="mt-8 flex">
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
                                data={varnishes?.data.map(r => ({ value: (r.id as number).toString(), label: r.name })) ?? []}
                            />
                        )}
                    />

                    <div className="ml-8 flex">
                        <Button leftIcon={<PlusIcon className="icon-field-left" />} color="green" variant="outline" className="mt-12" uppercase onClick={() => append({})}>
                            Aggiungi Pantone
                        </Button>

                        <div className="grid grid-cols-3 gap-4">
                            {fields.map((v, i) => (
                                <div key={v.id} className="flex items-end">
                                    <TextInput
                                        label="Pantone"
                                        size="xl"
                                        variant="filled"
                                        className="ml-4 flex-grow"
                                        required
                                        {...register(`pantones.${i}.name` as const, { required: 'Il pantone è obbligatorio se aggiunto' })}
                                        error={errors.pantones?.[i].name?.message}
                                    />

                                    <ActionIcon size="xl" color="red" className="ml-2 mb-2" onClick={() => removePantone(i)}>
                                        <TrashIcon />
                                    </ActionIcon>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <Button type="submit" size="sm" color="lime" variant="outline" uppercase className="w-full">
                        Aggiungi avviamento
                    </Button>
                </div>
            </form>

            {contract?.press && contract.press.filter(p => p.run_type?.kind === 'offset').length > 0 && (
                <>
                    <Title order={2} className="my-4">
                        Avviamenti
                    </Title>
                    <Table striped fontSize="lg">
                        <thead>
                            <tr>
                                <th className="px-4 py-2">Tipo</th>
                                <th className="px-4 py-2">Descrizione</th>
                                <th className="px-4 py-2">Carta</th>
                                <th className="px-4 py-2">Resa</th>
                                <th className="px-4 py-2">Colore</th>
                                <th className="px-4 py-2">Pantoni</th>
                                <th className="px-4 py-2">Vernice</th>
                                <th className="w-12" />
                            </tr>
                        </thead>
                        <tbody>
                            {contract?.press
                                ?.filter(p => p.run_type?.kind === 'offset')
                                .map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-2">{p.run_type.name}</td>
                                        <td className="px-4 py-2">{p.description}</td>
                                        <td className="px-4 py-2">
                                            {p.paper.name} {p.paper.weight}gr {p.paper.format} {p.paper.orientation}
                                        </td>
                                        <td className="px-4 py-2">{p.yield}</td>
                                        <td className="px-4 py-2">{p.colors.map(c => c.toUpperCase())}</td>
                                        <td className="px-4 py-2">{p.pantones ? p.pantones.map(n => n.name).join(', ') : '-'}</td>
                                        <td className="px-4 py-2">{p.varnish?.name ?? '-'}</td>
                                        <td>
                                            <ActionIcon color="red" size="lg" onClick={() => removeOffsetPrint(p.id as number)}>
                                                <TrashIcon />
                                            </ActionIcon>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </Table>

                    <Button size="xl" uppercase className="mt-8 w-full" onClick={() => save()}>
                        Salva
                    </Button>
                </>
            )}
        </>
    );
};

export default Step3;
