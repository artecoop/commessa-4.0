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

        if (error.response?.status === 403 && err.errors.map(p => p.extensions.code).includes('INVALID_TOKEN')) {
            console.log(err);
            const refreshToken = sessionStorage.getItem('token');
            if (refreshToken) {
                const result = await Axios.post('/auth/refresh', { refresh_token: JSON.parse(refreshToken)?.access_token });
                if (result.data) {
                    sessionStorage.setItem('token', JSON.stringify(result.data));
                    return axios.request(error.config);
                }
            }
        }

        if (error.response?.status === 500) {
            return Promise.reject({ status: error.response.status, data: error.response.data });
        }

        return Promise.reject();
    }
);

const apiGet = <T>(url: string, config?: AxiosRequestConfig) => Axios.get<T>(url, config && { params: config }).then(res => res.data);
const apiPost = <T>(url: string, data: unknown, config?: AxiosRequestConfig) => Axios.post<T>(url, data, config && { params: config }).then(res => res.data);
const apiPatch = <T>(url: string, data: unknown, config?: AxiosRequestConfig) => Axios.patch<T>(url, data, config && { params: config }).then(res => res.data);
const apiDelete = async <T>(url: string, config?: AxiosRequestConfig) => Axios.delete<T>(url, config && { params: config });

export { apiGet, apiPost, apiPatch, apiDelete };
