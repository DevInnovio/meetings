const express = require('express');
const AuthController = require('../controllers/AuthController');
const router = express.Router();
/*
//const authController = require('./controllers/AuthController');

router.get('/', AuthController.initiateAuth.bind(AuthController));
router.get('/callback', AuthController.handleAuthCallback.bind(AuthController));
*/
router.get('/', AuthController.authenticate);

module.exports = router;
