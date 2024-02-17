const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true},
    id_token: { type: String, required: true, unique: true },
    accessToken: { type: String, required: true },
    refreshToken: String,

});

module.exports = mongoose.model('Users', userSchema);
