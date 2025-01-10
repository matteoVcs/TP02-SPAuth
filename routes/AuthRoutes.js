const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/authorization-code', authController.authorizationCodeFlow);
router.get('/implicit-grant', authController.implicitGrantFlow);
router.get('/callback', authController.callback);

module.exports = router;