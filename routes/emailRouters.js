const express = require('express');
const router = express.Router();
const emailController = require('../controllers/EmailController');

router.post('/store-emails', emailController.syncUserEmails);

module.exports = router;
