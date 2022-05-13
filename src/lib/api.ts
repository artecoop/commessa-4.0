import qs from 'qs';

import { DirectusErrorBody, HTTPError } from 'types';

const fetchData = async (path: string, variables?: unknown, method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET') => {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: !path.startsWith('/auth/') && sessionStorage.getItem('token') ? `Bearer ${sessionStorage.getItem('token') ?? ''}` : ''
        }
    };

    let requestUrl = `https://36mmwjow.directus.app${path}`;

    switch (method) {
        case 'GET': {
            const queryString = qs.stringify(variables, { encodeValuesOnly: true });
            if (queryString) {
                requestUrl = `${requestUrl}?${queryString}`;
            }

            break;
        }
        case 'POST':
        case 'PATCH':
            options.body = JSON.stringify(variables);
            break;
    }

    const response = await fetch(requestUrl, options);

    if (!response.ok) {
        const errorBody = (await response.json()) as DirectusErrorBody;
        if (errorBody && errorBody.errors && errorBody.errors.length > 0) {
            throw new HTTPError(response.status, errorBody.errors.map(e => e.message).join(', '));
        }

        throw new HTTPError(response.status, response.statusText);
    }

    return response.json();
};

export default fetchData;
