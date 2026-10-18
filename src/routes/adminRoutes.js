const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');

// All routes in this router require authentication
router.use(requireAuth);

// Admin dashboard (list books, stats)
router.get('/dashboard', adminController.getDashboard);

// Add new book form & handler
router.get('/books/new', adminController.getAddBook);
router.post('/books', adminController.postAddBook);

// Edit existing book form & handler
router.get('/books/:id/edit', adminController.getEditBook);
router.put('/books/:id', adminController.putEditBook);

// Delete book
router.delete('/books/:id', adminController.deleteBook);

module.exports = router;
