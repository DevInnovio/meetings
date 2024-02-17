// utils/dbUtils.js
const User = require('../models/Users'); // Adjust the path to your User model as necessary
const mongoose = require('mongoose');

async function checkOrCreateCollection(collectionName) {
    if (mongoose.connection.readyState !== 1) {
        console.log('Mongoose is not connected to the database.');
        return;
    }

    const db = mongoose.connection.db;

    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        await db.createCollection(collectionName);
        console.log(`Collection ${collectionName} created.`);
    } else {
        console.log(`Collection ${collectionName} already exists.`);
    }
}

async function getLastEmailTimestamp(emailAddress) {
    // Ensure mongoose is connected
    if (mongoose.connection.readyState !== 1) {
        console.log('Mongoose is not connected to the database.');
        return;
    }

    const db = mongoose.connection.db;

    const collectionName = emailAddress;

    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        console.log(`Collection ${collectionName} does not exist.`);
        return null; // Return null if the collection doesn't exist
    }

    const collection = db.collection(collectionName);
    const latestEmail = await collection.find().sort({ receivedAt: -1 }).limit(1).toArray();

    if (latestEmail.length > 0) {
        return latestEmail[0].receivedAt;
    } else {
        console.log(`No emails found in ${collectionName}.`);
        return null;
    }
}


/**
 * Retrieves the access token for a user with the given email address.
 * @param {string} emailAddress The email address of the user whose access token is to be retrieved.
 * @returns {Promise<string|null>} The access token if found, or null if no user with the given email exists.
 */
async function getAccessTokenByEmail(emailAddress) {
    try {
        const user = await User.findOne({email: emailAddress});

        if (user) {
            return user.accessToken;
        } else {
            console.log(`No user found with email: ${emailAddress}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching access token for email ${emailAddress}:`, error);
        throw error;
    }
}

module.exports = { checkOrCreateCollection,getLastEmailTimestamp,getAccessTokenByEmail };
