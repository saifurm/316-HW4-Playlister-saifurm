const mongoose = require('mongoose');
const { DatabaseManager, DatabaseError } = require('../DatabaseManager');
const Playlist = require('../../models/playlist-model');
const User = require('../../models/user-model');

const DEFAULT_MONGO_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

class MongoDatabaseManager extends DatabaseManager {
    constructor() {
        super();
        this.connection = null;
    }

    async initialize() {
        if (this.connection) {
            await this.connection;
            return;
        }

        const uri = process.env.MONGO_URI || process.env.DB_CONNECT;
        if (!uri) {
            throw new DatabaseError('MongoDB connection string is not defined in environment configuration.');
        }

        try {
            this.connection = mongoose.connect(uri, DEFAULT_MONGO_OPTIONS);
            await this.connection;
        } catch (error) {
            throw new DatabaseError(`Failed to connect to MongoDB: ${error.message}`);
        }
    }

    #normalizeUser(userDoc) {
        if (!userDoc) {
            return null;
        }

        const user = typeof userDoc.toObject === 'function'
            ? userDoc.toObject({ versionKey: false })
            : { ...userDoc };

        user._id = user._id.toString();
        user.playlists = (user.playlists || []).map((id) => id.toString());
        return user;
    }

    #normalizePlaylist(playlistDoc) {
        if (!playlistDoc) {
            return null;
        }

        const playlist = typeof playlistDoc.toObject === 'function'
            ? playlistDoc.toObject({ versionKey: false })
            : { ...playlistDoc };

        playlist._id = playlist._id.toString();
        if (Array.isArray(playlist.songs)) {
            playlist.songs = playlist.songs.map((song) => {
                const { _id, ...rest } = song;
                return rest;
            });
        }
        return playlist;
    }

    async getUserById(id) {
        const user = await User.findById(id).lean({ virtuals: false });
        return this.#normalizeUser(user);
    }

    async getUserByEmail(email) {
        const user = await User.findOne({ email }).lean({ virtuals: false });
        return this.#normalizeUser(user);
    }

    async createUser(userData) {
        const user = new User({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            passwordHash: userData.passwordHash,
            playlists: userData.playlists || []
        });

        await user.save();
        return this.#normalizeUser(user);
    }

    async createPlaylist(userId, playlistData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        if (playlistData.ownerEmail !== user.email) {
            throw new DatabaseError('authentication error', 400);
        }

        const playlist = new Playlist({
            name: playlistData.name,
            songs: playlistData.songs,
            ownerEmail: user.email
        });

        await playlist.save();
        user.playlists.push(playlist._id);
        await user.save();

        return this.#normalizePlaylist(playlist);
    }

    async deletePlaylist(userId, playlistId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new DatabaseError('Playlist not found!', 404);
        }

        if (playlist.ownerEmail !== user.email) {
            throw new DatabaseError('authentication error', 400);
        }

        await Playlist.deleteOne({ _id: playlistId });
        user.playlists = (user.playlists || []).filter(
            (id) => id.toString() !== playlistId.toString()
        );
        await user.save();

        return true;
    }

    async getPlaylistById(userId, playlistId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new DatabaseError('Playlist not found!', 404);
        }

        if (playlist.ownerEmail !== user.email) {
            throw new DatabaseError('authentication error', 400);
        }

        return this.#normalizePlaylist(playlist);
    }

    async getPlaylistPairs(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        const playlists = await Playlist.find({ ownerEmail: user.email }).lean({ virtuals: false });
        return playlists.map((playlist) => ({
            _id: playlist._id.toString(),
            name: playlist.name
        }));
    }

    async getPlaylists(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        const playlists = await Playlist.find({ ownerEmail: user.email }).lean({ virtuals: false });
        return playlists.map((playlist) => this.#normalizePlaylist(playlist));
    }

    async updatePlaylist(userId, playlistId, playlistData) {
        const user = await User.findById(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new DatabaseError('Playlist not found!', 404);
        }

        if (playlist.ownerEmail !== user.email) {
            throw new DatabaseError('authentication error', 400);
        }

        playlist.name = playlistData.name;
        playlist.songs = playlistData.songs;
        await playlist.save();

        return this.#normalizePlaylist(playlist);
    }
}

module.exports = MongoDatabaseManager;
