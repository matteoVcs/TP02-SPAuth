const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/authorization-code', authController.authorizationCodeFlow);
router.get('/implicit-grant', authController.implicitGrantFlow);

module.exports = router;