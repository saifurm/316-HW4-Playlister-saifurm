/*
    This is our http api, which we use to send requests to
    our back-end API. We now issue all requests using the
    browser-native Fetch API.
    
    @author McKilla Gorilla
*/

const BASE_URL = 'http://localhost:4000/store';

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

export const createPlaylist = (newListName, newSongs, userEmail) => {
    return request('/playlist/', 'POST', {
        name: newListName,
        songs: newSongs,
        ownerEmail: userEmail
    });
};

export const deletePlaylistById = (id) => request(`/playlist/${id}`, 'DELETE');

export const getPlaylistById = (id) => request(`/playlist/${id}`, 'GET');

export const getPlaylistPairs = () => request('/playlistpairs/', 'GET');

export const updatePlaylistById = (id, playlist) => {
    return request(`/playlist/${id}`, 'PUT', { playlist });
};

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
};

export default apis
