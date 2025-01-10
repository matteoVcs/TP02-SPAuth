const express = require('express');
const songController = require('../controllers/songController');

const router = express.Router();

router.get('/', songController.getRecentlyPlayed);

module.exports = router;