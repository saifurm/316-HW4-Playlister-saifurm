const path = require('path');
const crypto = require('crypto');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const testData = require('../example-db-data.json');

const generateId = () => crypto.randomBytes(12).toString('hex');

async function resetPostgre() {
    const sequelize = new Sequelize(
        process.env.POSTGRES_DB,
        process.env.POSTGRES_USER,
        process.env.POSTGRES_PASSWORD,
        {
            host: process.env.POSTGRES_HOST,
            port: process.env.POSTGRES_PORT || 5432,
            dialect: 'postgres',
            logging: false
        }
    );

    const User = sequelize.define('User', {
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

    const Playlist = sequelize.define('Playlist', {
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

    User.hasMany(Playlist, { as: 'playlists', foreignKey: 'ownerId', sourceKey: 'id', onDelete: 'CASCADE' });
    Playlist.belongsTo(User, { as: 'owner', foreignKey: 'ownerId', targetKey: 'id' });

    try {
        await sequelize.authenticate();
        console.log('Connected to PostgreSQL');

        await sequelize.sync({ force: true });
        console.log('Cleared PostgreSQL data');

        const userMap = new Map();
        for (const user of testData.users) {
            const userId = generateId();
            const createdUser = await User.create({
                id: userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                passwordHash: user.passwordHash,
                playlistIds: user.playlists || []
            });
            userMap.set(user.email, createdUser);
        }

        for (const playlist of testData.playlists) {
            const owner = userMap.get(playlist.ownerEmail);
            if (!owner) {
                console.warn(`No owner found for playlist ${playlist.name} (${playlist.ownerEmail}), skipping`);
                continue;
            }

            const playlistId = playlist._id || generateId();
            await Playlist.create({
                id: playlistId,
                name: playlist.name,
                ownerEmail: playlist.ownerEmail,
                songs: playlist.songs,
                ownerId: owner.id
            });
        }

        console.log('PostgreSQL data reset complete');
    } catch (error) {
        console.error('Error resetting PostgreSQL data', error);
    } finally {
        await sequelize.close();
        console.log('Connection to PostgreSQL closed');
    }
}

resetPostgre();
