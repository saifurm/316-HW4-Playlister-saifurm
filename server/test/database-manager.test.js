import { afterAll, beforeAll, describe, expect, test } from 'vitest';
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { getDatabaseManager, DatabaseError } = require('../db');

const dbManager = getDatabaseManager();

const TEST_PASSWORD_HASH = '$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu';

const generateEmail = (label) => `test_${label}_${Date.now()}_${crypto.randomBytes(2).toString('hex')}@playlister.test`;
const generatePlaylistData = (ownerEmail, label) => ({
    name: `Test Playlist ${label}`,
    ownerEmail,
    songs: [
        { title: `Test Song ${label} A`, artist: 'Test Artist', year: 2020, youTubeId: 'dQw4w9WgXcQ' },
        { title: `Test Song ${label} B`, artist: 'Test Artist', year: 2021, youTubeId: '9bZkp7q19f0' }
    ]
});

let testUser = null;
const createdPlaylistIds = new Set();

const createTestPlaylist = async (label = 'generic') => {
    const playlist = await dbManager.createPlaylist(testUser._id, generatePlaylistData(testUser.email, label));
    createdPlaylistIds.add(playlist._id);
    return playlist;
};

describe('DatabaseManager', () => {
    beforeAll(async () => {
        await dbManager.initialize();
        testUser = await dbManager.createUser({
            firstName: 'Integration',
            lastName: 'Tester',
            email: generateEmail('user'),
            passwordHash: TEST_PASSWORD_HASH,
            playlists: []
        });
    });

    afterAll(async () => {
        for (const playlistId of createdPlaylistIds) {
            try {
                await dbManager.deletePlaylist(testUser._id, playlistId);
            } catch (error) {
                if (!(error instanceof DatabaseError)) {
                    console.error(error);
                }
            }
        }
    });

    test('initialize establishes a database connection', async () => {
        await expect(dbManager.initialize()).resolves.toBeUndefined();
    });

    test('getUserById returns the expected user', async () => {
        const user = await dbManager.getUserById(testUser._id);
        expect(user).toBeTruthy();
        expect(user.email).toBe(testUser.email);
        expect(Array.isArray(user.playlists)).toBe(true);
    });

    test('getUserByEmail returns the expected user', async () => {
        const user = await dbManager.getUserByEmail(testUser.email);
        expect(user).toBeTruthy();
        expect(user._id).toBe(testUser._id);
    });

    test('createUser persists a new user', async () => {
        const email = generateEmail('create');
        const created = await dbManager.createUser({
            firstName: 'Create',
            lastName: 'User',
            email,
            passwordHash: TEST_PASSWORD_HASH,
            playlists: []
        });
        expect(created).toBeTruthy();
        expect(created.email).toBe(email);
        expect(Array.isArray(created.playlists)).toBe(true);
    });

    test('createPlaylist adds a playlist for the user', async () => {
        const playlist = await createTestPlaylist('create');
        expect(playlist).toBeTruthy();
        expect(playlist.ownerEmail).toBe(testUser.email);
        const userAfter = await dbManager.getUserById(testUser._id);
        expect(userAfter.playlists).toContain(playlist._id);
    });

    test('getPlaylistById returns the stored playlist', async () => {
        const playlist = await createTestPlaylist('read');
        const fetched = await dbManager.getPlaylistById(testUser._id, playlist._id);
        expect(fetched).toBeTruthy();
        expect(fetched._id).toBe(playlist._id);
        expect(fetched.name).toBe(playlist.name);
    });

    test('getPlaylistPairs returns user playlist pairs', async () => {
        const playlist = await createTestPlaylist('pairs');
        const pairs = await dbManager.getPlaylistPairs(testUser._id);
        expect(Array.isArray(pairs)).toBe(true);
        const pair = pairs.find((p) => p._id === playlist._id);
        expect(pair).toBeTruthy();
        expect(pair.name).toBe(playlist.name);
    });

    test('getPlaylists returns full playlist data', async () => {
        const playlist = await createTestPlaylist('list');
        const playlists = await dbManager.getPlaylists(testUser._id);
        expect(Array.isArray(playlists)).toBe(true);
        const found = playlists.find((p) => p._id === playlist._id);
        expect(found).toBeTruthy();
        expect(found.songs.length).toBeGreaterThan(0);
    });

    test('updatePlaylist modifies playlist contents', async () => {
        const playlist = await createTestPlaylist('update');
        const updatedName = `${playlist.name} - Updated`;
        const updatedSongs = [
            { title: 'Updated Song A', artist: 'Tester', year: 2022, youTubeId: '3GwjfUFyY6M' }
        ];

        const updated = await dbManager.updatePlaylist(testUser._id, playlist._id, {
            name: updatedName,
            songs: updatedSongs
        });

        expect(updated.name).toBe(updatedName);
        expect(updated.songs).toEqual(updatedSongs);
    });

    test('deletePlaylist removes playlist for the user', async () => {
        const playlist = await createTestPlaylist('delete');
        await expect(dbManager.deletePlaylist(testUser._id, playlist._id)).resolves.toBe(true);
        createdPlaylistIds.delete(playlist._id);
        await expect(dbManager.getPlaylistById(testUser._id, playlist._id)).rejects.toBeInstanceOf(DatabaseError);
    });
});
