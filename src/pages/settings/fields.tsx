import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Field, FieldType } from 'types';

export const FieldsView: React.FC = () => {
    const [fields, setFields] = useState<Field[]>(JSON.parse(sessionStorage.getItem('fields') ?? '[]'));

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<Field>();

    const onSubmit = async (input: Field) => {
        const tmp = [...(fields ?? [])];
        const newId =
            fields
                ?.map(f => f.id)
                .sort((a, b) => a - b)
                .pop() ?? 0;

        input.fieldType = FieldType[input.fieldType as keyof typeof FieldType];

        tmp.push({ id: newId + 1, fieldName: input.fieldName, fieldType: input.fieldType });

        setFields(tmp);

        sessionStorage.setItem('fields', JSON.stringify(tmp));
    };

    return (
        <>
            <h3 className="mt-4 mb-8">Campi della commessa</h3>

            {fields?.map(f => (
                <div key={f.id}>
                    {f.id}: {f.fieldName} -&nbsp;
                    {(() => {
                        switch (f.fieldType) {
                            case FieldType.TEXTAREA:
                                return 'Testo lungo';
                            case FieldType.BOOLEAN:
                                return 'SI/NO';
                            case FieldType.NUMBER:
                                return 'Numerico';
                            default:
                                return 'Testo breve';
                        }
                    })()}
                </div>
            ))}

            <hr className="my-8" />

            <form className="mt-8" onSubmit={handleSubmit(onSubmit)}>
                <input type="text" {...register('fieldName', { required: true })} />
                {errors.fieldName && 'Il nome è obbligatorio'}

                <select {...register('fieldType', { required: true })} className="ml-4">
                    <option value="">...</option>
                    {Object.values(FieldType).map((f, i) => (
                        <option key={i} value={f}>
                            {f}
                        </option>
                    ))}
                </select>
                {errors.fieldType && 'Il tipo è obbligatorio'}

                <button type="submit" className="button green ml-4">
                    Aggiungi
                </button>
            </form>
        </>
    );
};
