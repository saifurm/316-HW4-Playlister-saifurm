const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });
const mongoose = require('mongoose');
const mongoUri = process.env.MONGO_URI || process.env.DB_CONNECT;

async function clearCollection(collection, collectionName) {
    try {
        await collection.deleteMany({});
        console.log(collectionName + " cleared");
    }
    catch (err) {
        console.log(err);
    }
}

async function fillCollection(collection, collectionName, data) {
    for (let i = 0; i < data.length; i++) {
        let doc = new collection(data[i]);
        await doc.save();
    }
    console.log(collectionName + " filled");
}

async function resetMongo() {
    const Playlist = require('../../../models/playlist-model')
    const User = require("../../../models/user-model")
    const testData = require("../example-db-data.json")

    console.log("Resetting the Mongo DB")
    await clearCollection(Playlist, "Playlist");
    await clearCollection(User, "User");
    await fillCollection(Playlist, "Playlist", testData.playlists);
    await fillCollection(User, "User", testData.users);
}

mongoose
    .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => { resetMongo() })
    .catch(e => {
        console.error('Connection error', e.message)
    })


