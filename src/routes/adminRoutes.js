const express = require('express');
const router = express.Router();
const multer = require('multer');

const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// Setup Multer memory storage (serverless-friendly, no disk reliance)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max file size
});

// All routes below require admin authentication
router.use(requireAuth);

// Admin dashboard (list books, stats)
router.get('/dashboard', adminController.getDashboard);

// Download Sample Demo CSV Template
router.get('/books/sample-csv', adminController.downloadSampleCsv);

// CSV Upload & Bulk Import
router.get('/books/import', adminController.getImportCsvPage);
router.post('/books/import', upload.single('csvFile'), adminController.postImportCsv);

// Add new book form & handler
router.get('/books/new', adminController.getAddBook);
router.post('/books', adminController.postAddBook);

// Edit existing book form & handler
router.get('/books/:id/edit', adminController.getEditBook);
router.put('/books/:id', adminController.putEditBook);

// Delete book
router.delete('/books/:id', adminController.deleteBook);

// Admin Credentials Settings (CREDINTIALS collection)
router.get('/settings', authController.getSettingsPage);
router.post('/settings', authController.postChangeCredentials);

module.exports = router;
