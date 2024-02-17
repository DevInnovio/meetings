const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Ensure your .env file contains the correct MONGO_URI

// Define the User schema
const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: String,
    tokenExpiryDate: Date,
    // Include any other fields as per your schema requirements
});

// Create a User model
const User = mongoose.model('User', userSchema);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// User data to insert
const userData = {
    googleId: 'sampleGoogleId123',
    accessToken: 'sampleAccessTokenXYZ',
    refreshToken: 'sampleRefreshTokenABC',
    tokenExpiryDate: new Date() // Set this to the actual expiry date in your use case
};

// Function to insert user data
const insertUserData = async () => {
    try {
        const newUser = new User(userData);
        const savedUser = await newUser.save();
        console.log('User inserted successfully:', savedUser);
        mongoose.connection.close(); // Close the connection after the operation
    } catch (error) {
        console.error('Error inserting user data:', error);
        mongoose.connection.close(); // Ensure connection is closed even if there's an error
    }
};

// Execute the function to insert user data
insertUserData();
