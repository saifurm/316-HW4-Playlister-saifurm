/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. We now rely
    on the native Fetch API so that no third-party request client
    is required.
    
    @author McKilla Gorilla
*/

const BASE_URL = 'http://localhost:4000/auth';

const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
        data = await response.json();
    } else if (contentType.length > 0) {
        data = await response.text();
    }

    const result = { status: response.status, data };

    if (!response.ok) {
        const error = new Error(`Request failed with status ${response.status}`);
        error.response = result;
        throw error;
    }

    return result;
};

const buildOptions = (method, body) => {
    const options = {
        method,
        credentials: 'include',
        headers: {}
    };

    if (body !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    return options;
};

const request = (path, method, body) => {
    return fetch(`${BASE_URL}${path}`, buildOptions(method, body)).then(parseResponse);
};

export const getLoggedIn = () => request('/loggedIn/', 'GET');

export const loginUser = (email, password) => {
    return request('/login/', 'POST', { email, password });
};

export const logoutUser = () => request('/logout/', 'GET');

export const registerUser = (firstName, lastName, email, password, passwordVerify) => {
    return request('/register/', 'POST', {
        firstName,
        lastName,
        email,
        password,
        passwordVerify
    });
};

const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
};

export default apis
