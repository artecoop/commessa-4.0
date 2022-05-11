export type FetchResult<T> = {
    data: T;
    meta?: Meta;
};

export type Meta = {
    total_count?: number;
    filter_count?: number;
};

export type LoginResult = {
    access_token: string;
    expires: number;
    refresh_token: string;
};

export type Profile = {
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    last_access: Date;
};

export enum FieldType {
    TEXT = 'text',
    TEXTAREA = 'textarea',
    NUMBER = 'number',
    CHECKBOX = 'checkbox'
}

export type Field = {
    id: number;
    name: string;
    type: FieldType;
};

export type Processing = {
    id: number;
    name: string;
};

export type Commessa = {
    id: number;
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
