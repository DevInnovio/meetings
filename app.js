const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const emailRoutes = require('./routes/emailRouters');
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

app.use(express.json());

app.use('/api/emails/', emailRoutes);
app.use('/api/auth/', authRoutes);

// Define a root route for simple server status check
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Set the port
const port = process.env.PORT || 3141; // You can use the port variable you defined earlier or get it from environment variables

// Listen on the port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
/*
const AuthController = require("./Controllers/AuthController");


const EmailController = require("./Controllers/EmailController");
*/

//AuthController.authenticate();
//const testEmail = 'nurielbarproject@gmail.com';
//EmailController.syncUserEmails2(testEmail);
// Middleware
// Export the app for testing or further usage
module.exports = app;
