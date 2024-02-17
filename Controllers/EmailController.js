const { getAccessTokenByEmail, checkOrCreateCollection, getLastEmailTimestamp } = require('../utils/dbUtils'); // Adjust the path as needed
const GmailApiService = require('../services/GmailApiService');
const EmailModel = require('../models/Email')
const mongoose = require('mongoose');
const { EmailSchema } = require('../models/Email');

exports.syncUserEmails = async (req, res) => {
    try {
        if (!req.body || !req.body.email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        const { email } = req.body; // Extracting the email from the request body

        if (!email ) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const accessToken = await getAccessTokenByEmail(email);
        if (!accessToken) {
            return res.status(404).json({ message: 'Email does not exist or access token not found' });
        }

        await checkOrCreateCollection(email);

        const gmailService = new GmailApiService(email, accessToken);

        const lastTimestamp = await getLastEmailTimestamp(email);

        const newEmails = await gmailService.fetchEmailsSince(lastTimestamp);

        for (const emailData of newEmails) {
            const collectionName = email.toLowerCase();
            const EmailModelForUser = mongoose.model('Email', EmailSchema, collectionName);
            const newEmail = new EmailModelForUser(emailData);
            await newEmail.save();
        }

        res.json({ message: 'Emails synchronized successfully.' });
    } catch (error) {
        console.error('Failed to synchronize emails:', error);
        res.status(500).json({ message: 'Failed to synchronize emails' });
    }
};

/*
async function syncUserEmails2(emailAddress) {
    try {
        // Step 1: Find the user's access token
        const accessToken = await getAccessTokenByEmail(emailAddress);
        if (!accessToken) {
            throw new Error('Email does not exist');
        }

        // Step 2: Check if a collection exists for the email, or create it
        await checkOrCreateCollection(emailAddress);

        // Step 3: Initialize GmailApiService with the access token
        const gmailService = new GmailApiService(emailAddress, accessToken);

        // Step 4: Check the last email timestamp in the DB
       // const //lastTimestamp = await getLastEmailTimestamp(emailAddress);

        // Step 5: Fetch emails from Gmail after the last timestamp and store them
        const newEmails = await gmailService.fetchEmailsSince(lastTimestamp);

        // Assuming newEmails is an array of email objects
        for (const emailData of newEmails) {
            // Use 'emailAddress' directly as the collection name
            // Note: Model names are usually singular and capitalized by convention, but the collection name can be lowercase
            const collectionName = emailAddress.toLowerCase(); // Ensure the collection name is in lowercase to avoid case sensitivity issues
            const EmailModelForUser = mongoose.model('Email', EmailSchema, collectionName);

            const newEmail = new EmailModelForUser(emailData);

            // Save the new email document in the collection named after the emailAddress
            await newEmail.save();
        }

        return 'Emails synchronized successfully.';
    } catch (error) {
        console.error('Failed to synchronize emails:', error);
        throw error; // Rethrow the error to be handled by the caller
    }

}
*/
//module.exports = {syncUserEmails };




