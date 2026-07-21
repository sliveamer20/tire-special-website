const express = require('express');
const { getTireSearch } = require('../controllers/tireSearchController');

const router = express.Router();

router.get('/tires/search', getTireSearch);

module.exports = router;
