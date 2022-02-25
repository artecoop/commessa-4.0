import { useState } from 'react';

import { Commessa, Field, FieldType, CommessaProcessing, Processing } from 'types';

import Layout from '@components/_layout';
import { useFieldArray, useForm } from 'react-hook-form';

export const ManageCommessa: React.FC = () => {
    const [availableFields] = useState<Field[]>(JSON.parse(sessionStorage.getItem('fields') ?? '[]'));
    const [availableProcessings] = useState<Processing[]>(JSON.parse(sessionStorage.getItem('processings') ?? '[]'));

    const [selectedField, setSelectedField] = useState(-1);

    const {
        handleSubmit,
        register,
        control,
        formState: { errors }
    } = useForm<Commessa>();

    const {
        fields: fieldsFields,
        append: appendField,
        remove: removeField
    } = useFieldArray({
        name: 'fields',
        control
    });

    const {
        fields: processingsFields,
        append: appendProcessing,
        remove: removeProcessing
    } = useFieldArray({
        name: 'processings',
        control
    });

    const addField = () => {
        if (selectedField > -1) {
            const field = availableFields.find(a => a.id === selectedField);
            if (field) {
                appendField({ field, value: '' });
                setSelectedField(-1);
            }
        }
    };

    const onSubmit = async (input: Commessa) => {
        console.log(input);
    };

    return (
        <Layout title="Aggiungi Commessa<">
            <h1>Aggiungi Commessa</h1>

            <form className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="title">Titolo</label>
                <input type="text" {...register('title', { required: true })} className="w-full" />
                {errors.title && 'Il nome è obbligatorio'}

                {fieldsFields.map((field, index) => (
                    <div key={field.id} className="mt-4 flex">
                        <div className="flex-1">
                            <div>{field.field.fieldName}</div>

                            {(() => {
                                switch (field.field.fieldType) {
                                    case FieldType.TEXTAREA:
                                        return <textarea {...register(`fields.${index}.value` as const, { required: true })} />;
                                    case FieldType.BOOLEAN:
                                        return <input type="checkbox" {...register(`fields.${index}.value` as const)} />;
                                    case FieldType.NUMBER:
                                        return <input type="text" {...register(`fields.${index}.value` as const, { required: true })} />;
                                    default:
                                        return <input type="text" {...register(`fields.${index}.value` as const, { required: true })} />;
                                }
                            })()}
                            {errors?.fields?.[index]?.value && `Il campo ${field.field.fieldName} è obbligatorio`}
                        </div>

                        <button type="button" className="button red ml-4" onClick={() => removeField(index)}>
                            Elimina
                        </button>
                    </div>
                ))}

                {processingsFields.length > 0 && (
                    <>
                        <h4>Lavorazioni</h4>
                        {processingsFields.map((field, index) => (
                            <div key={field.id} className="mt-4 flex">
                                <div className="flex flex-1 flex-col">
                                    <label htmlFor="processingName">Lavorazione</label>
                                    <select {...register(`processings.${index}.processing` as const, { required: true })}>
                                        <option>...</option>
                                        {availableProcessings?.map(f => (
                                            <option key={f.id} value={f.id}>
                                                {f.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors?.processings?.[index]?.processing && 'La lavorazione è obbligatoria'}

                                    <label htmlFor="processingDescription">Descrizione (facoltativo)</label>
                                    <textarea {...register(`processings.${index}.description` as const)} />
                                    <label htmlFor="processingName">Ore (facoltativo)</label>
                                    <input type="number" {...register(`processings.${index}.hours` as const, { valueAsNumber: true })} />
                                </div>

                                <button type="button" className="button red ml-4" onClick={() => removeProcessing(index)}>
                                    Elimina
                                </button>
                            </div>
                        ))}
                    </>
                )}

                <hr className="my-8" />

                <div className="flex">
                    <div className="flex-1 bg-slate-100 p-2">
                        <h5>Aggiungi campi</h5>
                        <div className="mt-4">
                            <select value={selectedField} onChange={e => setSelectedField(+e.target.value)}>
                                <option value={-1}>...</option>
                                {availableFields?.map((f, i) => (
                                    <option key={i} value={f.id}>
                                        {f.fieldName}
                                    </option>
                                ))}
                            </select>
                            <button type="button" onClick={() => addField()} className="button green ml-4">
                                Aggiungi
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 bg-blue-100 p-2">
                        <h5>Aggiungi lavorazione</h5>
                        <button type="button" onClick={() => appendProcessing({})} className="button green mt-4">
                            Aggiungi
                        </button>
                    </div>
                </div>

                <button type="submit" className="button green mt-8 w-full">
                    Salva
                </button>
            </form>
        </Layout>
    );
};
