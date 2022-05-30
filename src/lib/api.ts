import axios, { AxiosRequestConfig } from 'axios';

import { DirectusErrorBody } from 'types';

const Axios = axios.create({ baseURL: 'https://36mmwjow.directus.app' });

Axios.interceptors.request.use(
    async config => {
        config.headers = config.headers ?? {};

        const token = sessionStorage.getItem('token') && `Bearer ${JSON.parse(sessionStorage.getItem('token') ?? '{}')?.access_token}`;
        if (token) {
            config.headers['Authorization'] = token;
        }

        config.headers['Content-Type'] = 'application/json';

        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

Axios.interceptors.response.use(
    response => {
        return Promise.resolve(response);
    },
    async error => {
        const err = error.response.data as DirectusErrorBody;

        if (!error.config.url.endsWith('/auth/refresh') && error.response?.status === 403 && err.errors.map(e => e.extensions.code).some(e => ['INVALID_TOKEN', 'TOKEN_EXPIRED'].includes(e))) {
            const storedTokens = sessionStorage.getItem('token');
            if (storedTokens) {
                try {
                    const result = await axios.create({ baseURL: 'https://36mmwjow.directus.app' }).post('/auth/refresh', { refresh_token: JSON.parse(storedTokens)?.refresh_token });
                    if (result.data) {
                        sessionStorage.setItem('token', JSON.stringify(result.data.data));
                        return Axios.request(error.config);
                    }
                } catch (e) {
                    return Promise.reject(e);
                }
            }
        }

        if (err.errors) {
            return Promise.reject(new Error(err.errors.map(e => e.message).join(', ')));
        }

        return Promise.reject(error);
    }
);

const apiGet = <T>(url: string, config?: AxiosRequestConfig) => Axios.get<T>(url, config && { params: config }).then(res => res.data);
const apiPost = <T>(url: string, data: unknown, config?: AxiosRequestConfig) => Axios.post<T>(url, data, config && { params: config }).then(res => res.data);
const apiPatch = <T>(url: string, data: unknown, config?: AxiosRequestConfig) => Axios.patch<T>(url, data, config && { params: config }).then(res => res.data);
const apiDelete = async <T>(url: string, config?: AxiosRequestConfig) => Axios.delete<T>(url, config && { params: config });

export { apiGet, apiPost, apiPatch, apiDelete };
