import { getAuthToken } from './cookies';

export function apiCall(endpoint, options) {
    options = options || {};
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }

    return fetch(endpoint, {
        method: options.method || 'GET',
        headers: headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function(response) {
        if (response.status === 204) {
            return { success: true };
        }

        return response.json().then(function(data) {
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            return data;
        });
    });
}