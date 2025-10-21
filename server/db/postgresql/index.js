const crypto = require('crypto');
const { Sequelize, DataTypes } = require('sequelize');
const { DatabaseManager, DatabaseError } = require('../DatabaseManager');

const generateId = () => crypto.randomBytes(12).toString('hex');

class PostgresDatabaseManager extends DatabaseManager {
    constructor() {
        super();
        this.sequelize = null;
        this.User = null;
        this.Playlist = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) {
            return;
        }

        if (!this.sequelize) {
            const {
                POSTGRES_DB,
                POSTGRES_USER,
                POSTGRES_PASSWORD,
                POSTGRES_HOST,
                POSTGRES_PORT
            } = process.env;

            if (!POSTGRES_DB || !POSTGRES_USER || !POSTGRES_HOST) {
                throw new DatabaseError('PostgreSQL environment variables are not fully configured.');
            }

            this.sequelize = new Sequelize(
                POSTGRES_DB,
                POSTGRES_USER,
                POSTGRES_PASSWORD,
                {
                    host: POSTGRES_HOST,
                    port: POSTGRES_PORT || 5432,
                    dialect: 'postgres',
                    logging: false
                }
            );
        }

        if (!this.User || !this.Playlist) {
            this.#defineModels();
        }

        try {
            await this.sequelize.authenticate();
            await this.User.sync();
            await this.Playlist.sync();
            this.initialized = true;
        } catch (error) {
            throw new DatabaseError(`Failed to initialize PostgreSQL: ${error.message}`);
        }
    }

    #defineModels() {
        this.User = this.sequelize.define('User', {
            id: {
                type: DataTypes.STRING(24),
                primaryKey: true,
                allowNull: false
            },
            firstName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lastName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true
            },
            passwordHash: {
                type: DataTypes.STRING,
                allowNull: false
            },
            playlistIds: {
                type: DataTypes.ARRAY(DataTypes.STRING),
                allowNull: false,
                defaultValue: []
            }
        }, {
            tableName: 'users'
        });

        this.Playlist = this.sequelize.define('Playlist', {
            id: {
                type: DataTypes.STRING(24),
                primaryKey: true,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            ownerEmail: {
                type: DataTypes.STRING,
                allowNull: false
            },
            songs: {
                type: DataTypes.JSONB,
                allowNull: false,
                defaultValue: []
            },
            ownerId: {
                type: DataTypes.STRING(24),
                allowNull: false
            }
        }, {
            tableName: 'playlists'
        });

        this.User.hasMany(this.Playlist, { as: 'playlists', foreignKey: 'ownerId', sourceKey: 'id', onDelete: 'CASCADE' });
        this.Playlist.belongsTo(this.User, { as: 'owner', foreignKey: 'ownerId', targetKey: 'id' });
    }

    #formatUser(userInstance) {
        if (!userInstance) {
            return null;
        }

        const user = userInstance.get({ plain: true });
        return {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            passwordHash: user.passwordHash,
            playlists: user.playlistIds || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    #formatPlaylist(playlistInstance) {
        if (!playlistInstance) {
            return null;
        }

        const playlist = playlistInstance.get({ plain: true });
        return {
            _id: playlist.id,
            name: playlist.name,
            ownerEmail: playlist.ownerEmail,
            songs: playlist.songs || [],
            createdAt: playlist.createdAt,
            updatedAt: playlist.updatedAt
        };
    }

    async getUserById(id) {
        await this.initialize();
        const user = await this.User.findByPk(id);
        return this.#formatUser(user);
    }

    async getUserByEmail(email) {
        await this.initialize();
        const user = await this.User.findOne({ where: { email } });
        return this.#formatUser(user);
    }

    async createUser(userData) {
        await this.initialize();
        const id = userData._id || generateId();
        const user = await this.User.create({
            id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            passwordHash: userData.passwordHash,
            playlistIds: userData.playlists || []
        });

        return this.#formatUser(user);
    }

    async createPlaylist(userId, playlistData) {
        await this.initialize();

        const user = await this.User.findByPk(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        if (playlistData.ownerEmail !== user.email) {
            throw new DatabaseError('authentication error', 400);
        }

        const playlistId = generateId();
        const playlist = await this.Playlist.create({
            id: playlistId,
            name: playlistData.name,
            ownerEmail: user.email,
            songs: playlistData.songs,
            ownerId: user.id
        });

        const playlistIds = Array.isArray(user.playlistIds) ? [...user.playlistIds, playlistId] : [playlistId];
        await user.update({ playlistIds });

        return this.#formatPlaylist(playlist);
    }

    async deletePlaylist(userId, playlistId) {
        await this.initialize();

        const user = await this.User.findByPk(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        const playlist = await this.Playlist.findOne({ where: { id: playlistId, ownerId: userId } });
        if (!playlist) {
            throw new DatabaseError('Playlist not found!', 404);
        }

        await playlist.destroy();

        const playlistIds = (user.playlistIds || []).filter((id) => id !== playlistId);
        await user.update({ playlistIds });

        return true;
    }

    async getPlaylistById(userId, playlistId) {
        await this.initialize();

        const playlist = await this.Playlist.findOne({ where: { id: playlistId, ownerId: userId } });
        if (!playlist) {
            throw new DatabaseError('Playlist not found!', 404);
        }

        return this.#formatPlaylist(playlist);
    }

    async getPlaylistPairs(userId) {
        await this.initialize();

        const user = await this.User.findByPk(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        const playlists = await this.Playlist.findAll({
            where: { ownerId: userId },
            attributes: ['id', 'name']
        });

        return playlists.map((playlist) => ({
            _id: playlist.id,
            name: playlist.name
        }));
    }

    async getPlaylists(userId) {
        await this.initialize();

        const user = await this.User.findByPk(userId);
        if (!user) {
            throw new DatabaseError('User not found!', 404);
        }

        const playlists = await this.Playlist.findAll({
            where: { ownerId: userId }
        });

        return playlists.map((playlist) => this.#formatPlaylist(playlist));
    }

    async updatePlaylist(userId, playlistId, playlistData) {
        await this.initialize();

        const playlist = await this.Playlist.findOne({ where: { id: playlistId, ownerId: userId } });
        if (!playlist) {
            throw new DatabaseError('Playlist not found!', 404);
        }

        await playlist.update({
            name: playlistData.name,
            songs: playlistData.songs
        });

        return this.#formatPlaylist(playlist);
    }
}

module.exports = PostgresDatabaseManager;
