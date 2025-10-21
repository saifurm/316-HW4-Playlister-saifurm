const dotenv = require('dotenv');
const { DatabaseError } = require('./DatabaseManager');
const MongoDatabaseManager = require('./mongodb');
const PostgresDatabaseManager = require('./postgresql');

dotenv.config();

let cachedManager = null;

const createManager = () => {
    const target = (process.env.CURRENT_DATABASE || 'MONGO').toLowerCase();
    switch (target) {
        case 'postgres':
        case 'postgresql':
        case 'pg':
            return new PostgresDatabaseManager();
        case 'mongo':
        case 'mongodb':
        default:
            return new MongoDatabaseManager();
    }
};

const getDatabaseManager = () => {
    if (!cachedManager) {
        cachedManager = createManager();
    }
    return cachedManager;
};

module.exports = {
    getDatabaseManager,
    DatabaseError
};

