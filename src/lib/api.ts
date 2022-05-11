import qs from 'qs';

const fetchData = async (path: string, variables?: unknown, method: 'GET' | 'POST' = 'GET') => {
    // Merge default and user options
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: !path.startsWith('/auth/') && sessionStorage.getItem('token') ? `Bearer ${sessionStorage.getItem('token') ?? ''}` : ''
        }
    };

    // Build request URL
    let requestUrl = `https://36mmwjow.directus.app${path}`;

    if (method === 'GET') {
        const queryString = qs.stringify(variables, { encodeValuesOnly: true });
        if (queryString) {
            requestUrl = `${requestUrl}?${queryString}`;
        }
    } else {
        options.body = JSON.stringify(variables);
    }

    // Trigger API call
    const response = await fetch(requestUrl, options);

    // Handle response
    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
};

export default fetchData;
