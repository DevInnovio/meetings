const mongoose = require('mongoose');

// Define the schema for email data
const EmailSchema = new mongoose.Schema({
    direction: {
        type: Boolean, // true for incoming, false for outgoing
        required: false
    },
    timestamp: {
        type: Date, // Using Date type for timestamps
        required: false
    },
    from: {
        type: String, // Email address of the sender
        required: true
    },
    to: {
        type: String, // Email address of the recipient
        required: true
    },
    snippet: {
        type: String, // A short summary or snippet of the email content
        required: false // This might not be required for every email
    },
    content: {
        type: String, // The full content of the email
        required: true
    },
    subject: {
        type: String, // The subject line of the email
        required: false
    },
    receivedAt: {
        type: Date, // The subject line of the email
        required: false
    }
}, {
    timestamps: false, // Mongoose option to automatically manage createdAt and updatedAt properties
    collection: 'emails' // Default collection name, can be overridden when creating a model instance
});

// Export the model, associating it with the 'Email' name and schema
const Email = mongoose.model('Email', EmailSchema);
module.exports = Email;
module.exports = { Email, EmailSchema };

