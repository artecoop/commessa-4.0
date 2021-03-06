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
    customer_order_ref: string;
    title: string;
    description?: string;
    desired_delivery?: Date;
    estimate?: string;
    estimate_date?: Date;
    representative: string;
    quantity: number;
    processings?: Processing[];
    press?: Press[];
};

export type Processing = {
    id?: number;
    process_definition: ProcessDefinition;
    name: string;
    setup_hours?: number | null;
    estimate_hours: number;
    working_hours?: number | null;
    expected_quantity?: number;
    actual_quantity?: number | null;
    notes?: ProcessingNote[];
};

export type ProcessingNote = {
    id?: number;
    description: string;
};

export type Press = {
    id?: number;
    run_type: RunType;
    description?: string;
    colors?: string[];
    pantones?: Pantone[];
    varnish?: Varnish;
    yield: number;
    paper: Paper;
    sheets?: number;
    setup_sheets?: number | null;
    produced_sheets?: number | null;
    wasted_sheets?: number | null;
    working_hours?: number | null;
    notes?: ProcessingNote[];
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

export type ProcessDefinition = {
    id?: number;
    name: string;
    pre: boolean;
    special: boolean;
};

export type RunType = {
    id?: number;
    name: string;
    kind: 'offset' | 'digital';
};

export type Varnish = {
    id?: number;
    name: string;
    add_plate: boolean;
};
