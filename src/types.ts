export enum FieldType {
    TEXT = 'TEXT',
    TEXTAREA = 'TEXTAREA',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN'
}

export type Field = {
    id: number;
    fieldName: string;
    fieldType: FieldType;
};

export type Processing = {
    id: number;
    name: string;
};

export type Commessa = {
    title: string;
    createdAt: Date;
    fields?: CommessaField[];
    processings?: CommessaProcessing[];
};

export type CommessaField = {
    field: Field;
    value: string | number | boolean;
};

export type CommessaProcessing = {
    processing: Processing;
    description?: string;
    hours?: number;
};
