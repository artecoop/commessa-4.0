export type FetchResult<T> = {
    data: T;
    meta?: Meta;
};

export type Meta = {
    total_count?: number;
    filter_count?: number;
};

export class HTTPError extends Error {
    code: number;

    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}

export type DirectusErrorBody = {
    errors: {
        message: string;
        extensions: {
            code: string;
        };
    }[];
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

export type Contract = {
    id?: number;
    number: number;
    date: Date;
    customer: string;
    title: string;
    description?: string;
    desired_delivery?: Date;
    estimate?: string;
    estimate_date?: Date;
    representative: string;
    quantity?: number;
    processings?: Processing[];
    offset_prints?: OffsetPrint[];
    digital_prints?: DigitalPrint[];
};

export type Processing = {
    id?: number;
    name: string;
    setup_hours?: number;
    estimate_hours: number;
    working_hours: number;
    kind: string;
    note?: string;
};

export type OffsetPrint = {
    id?: number;
    run_type: string;
    colors?: string[];
    pantones?: Pantone[];
    varnish?: string;
    yield: number;
    paper: number;
};

export type DigitalPrint = {
    id?: number;
    kind: string;
    description: string;
    color: boolean;
    sheets: number;
    paper: number;
};

export type Paper = {
    id?: number;
    name: string;
    weight: number;
    format: string;
    orientation?: string;
};

export type Pantone = {
    name: string;
};
