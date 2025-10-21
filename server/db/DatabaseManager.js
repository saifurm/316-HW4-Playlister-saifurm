class DatabaseError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = 'DatabaseError';
        this.status = status;
    }
}

class DatabaseManager {
    async initialize() {
        throw new DatabaseError('initialize not implemented');
    }

    async getUserById(_id) {
        throw new DatabaseError('getUserById not implemented');
    }

    async getUserByEmail(email) {
        throw new DatabaseError('getUserByEmail not implemented');
    }

    async createUser(userData) {
        throw new DatabaseError('createUser not implemented');
    }

    async createPlaylist(userId, playlistData) {
        throw new DatabaseError('createPlaylist not implemented');
    }

    async deletePlaylist(userId, playlistId) {
        throw new DatabaseError('deletePlaylist not implemented');
    }

    async getPlaylistById(userId, playlistId) {
        throw new DatabaseError('getPlaylistById not implemented');
    }

    async getPlaylistPairs(userId) {
        throw new DatabaseError('getPlaylistPairs not implemented');
    }

    async getPlaylists(userId) {
        throw new DatabaseError('getPlaylists not implemented');
    }

    async updatePlaylist(userId, playlistId, playlistData) {
        throw new DatabaseError('updatePlaylist not implemented');
    }
}

module.exports = {
    DatabaseManager,
    DatabaseError
};
