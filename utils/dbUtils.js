// utils/dbUtils.js
const User = require('../models/Users'); // Adjust the path to your User model as necessary
const mongoose = require('mongoose');

async function checkOrCreateCollection(collectionName) {
    // Ensure mongoose is connected
    if (mongoose.connection.readyState !== 1) {
        console.log('Mongoose is not connected to the database.');
        return;
    }

    const db = mongoose.connection.db;

    // Check if the collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        // Collection does not exist, create it
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

    // Use the email address as the collection name
    const collectionName = emailAddress;

    // Check if the collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length === 0) {
        console.log(`Collection ${collectionName} does not exist.`);
        return null; // Return null if the collection doesn't exist
    }

    // If the collection exists, query the latest email
    const collection = db.collection(collectionName);
    const latestEmail = await collection.find().sort({ receivedAt: -1 }).limit(1).toArray();

    if (latestEmail.length > 0) {
        return latestEmail[0].receivedAt; // Return the timestamp of the latest email
    } else {
        console.log(`No emails found in ${collectionName}.`);
        return null; // Return null if no emails are found
    }
}


/**
 * Retrieves the access token for a user with the given email address.
 * @param {string} emailAddress The email address of the user whose access token is to be retrieved.
 * @returns {Promise<string|null>} The access token if found, or null if no user with the given email exists.
 */
async function getAccessTokenByEmail(emailAddress) {
    try {
        // Find the user document with the matching email address
        const user = await User.findOne({email: emailAddress});

        if (user) {
            // User found, return the access token
            return user.accessToken;
        } else {
            // No user found with the given email address
            console.log(`No user found with email: ${emailAddress}`);
            return null;
        }
    } catch (error) {
        // Log and rethrow any errors encountered during the database query
        console.error(`Error fetching access token for email ${emailAddress}:`, error);
        throw error; // Rethrowing the error allows calling functions to handle it as needed
    }
}

module.exports = { checkOrCreateCollection,getLastEmailTimestamp,getAccessTokenByEmail };
