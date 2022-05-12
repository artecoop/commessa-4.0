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
};
