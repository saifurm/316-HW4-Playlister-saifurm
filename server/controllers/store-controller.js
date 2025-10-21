const auth = require('../auth');
const { getDatabaseManager, DatabaseError } = require('../db');

const db = getDatabaseManager();

const resolveUserId = (req, res) => {
    if (req.userId) {
        return req.userId;
    }

    const verified = auth.verifyUser(req);
    if (!verified) {
        res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        });
        return null;
    }

    return verified;
};

const handleStoreError = (res, error, fallbackMessage = 'Internal server error', fallbackStatus = 500) => {
    if (error instanceof DatabaseError) {
        const status = error.status || fallbackStatus;
        return res.status(status).json({
            errorMessage: error.message
        });
    }
    console.error(error);
    return res.status(fallbackStatus).json({
        errorMessage: fallbackMessage
    });
};

createPlaylist = async (req, res) => {
    const userId = resolveUserId(req, res);
    if (!userId) {
        return;
    }

    const body = req.body;
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        });
    }

    try {
        const playlist = await db.createPlaylist(userId, body);
        return res.status(201).json({
            playlist
        });
    } catch (error) {
        return handleStoreError(res, error, 'Playlist Not Created!', 400);
    }
};

deletePlaylist = async (req, res) => {
    const userId = resolveUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        await db.deletePlaylist(userId, req.params.id);
        return res.status(200).json({});
    } catch (error) {
        return handleStoreError(res, error, 'Failed to delete playlist');
    }
};

getPlaylistById = async (req, res) => {
    const userId = resolveUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const playlist = await db.getPlaylistById(userId, req.params.id);
        return res.status(200).json({
            success: true,
            playlist
        });
    } catch (error) {
        if (error instanceof DatabaseError && error.status === 400) {
            return res.status(400).json({
                success: false,
                description: error.message
            });
        }
        if (error instanceof DatabaseError && error.status === 404) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        console.error(error);
        return res.status(400).json({
            success: false,
            error: 'Failed to retrieve playlist'
        });
    }
};

getPlaylistPairs = async (req, res) => {
    const userId = resolveUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const pairs = await db.getPlaylistPairs(userId);
        if (!pairs) {
            return res.status(404).json({
                success: false,
                error: 'Playlists not found'
            });
        }

        return res.status(200).json({
            success: true,
            idNamePairs: pairs
        });
    } catch (error) {
        return handleStoreError(res, error, 'Failed to load playlists');
    }
};

getPlaylists = async (req, res) => {
    const userId = resolveUserId(req, res);
    if (!userId) {
        return;
    }

    try {
        const playlists = await db.getPlaylists(userId);
        if (!playlists || !playlists.length) {
            return res.status(404).json({
                success: false,
                error: 'Playlists not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: playlists
        });
    } catch (error) {
        return handleStoreError(res, error, 'Failed to load playlists');
    }
};

updatePlaylist = async (req, res) => {
    const userId = resolveUserId(req, res);
    if (!userId) {
        return;
    }

    const body = req.body;
    if (!body || !body.playlist) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        });
    }

    try {
        const updatedPlaylist = await db.updatePlaylist(userId, req.params.id, body.playlist);
        return res.status(200).json({
            success: true,
            id: updatedPlaylist._id,
            message: 'Playlist updated!'
        });
    } catch (error) {
        if (error instanceof DatabaseError && error.status === 400) {
            return res.status(400).json({
                success: false,
                description: error.message
            });
        }
        if (error instanceof DatabaseError && error.status === 404) {
            return res.status(404).json({
                message: error.message
            });
        }
        console.error(error);
        return res.status(404).json({
            message: 'Playlist not updated!'
        });
    }
};

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
};
