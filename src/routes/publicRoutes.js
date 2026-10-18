const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Home page with flexible search and category/shelf filters
router.get('/', publicController.getHomePage);

// Single book detail view
router.get('/books/:id', publicController.getBookDetails);

module.exports = router;
