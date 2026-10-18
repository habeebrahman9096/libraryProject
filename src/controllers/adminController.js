const Book = require('../models/Book');
const { parseCsvString, getSampleCsvContent } = require('../utils/csvHelper');

// Admin Dashboard - View and manage all books
const getDashboard = async (req, res) => {
  try {
    const { q, category, shelfNumber } = req.query;
    const filter = {};

    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      filter.$or = [
        { bookName: searchRegex },
        { author: searchRegex },
        { category: searchRegex },
        { libraryCode: searchRegex },
        { shelfNumber: searchRegex }
      ];
    }

    if (category && category.trim()) {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (shelfNumber && shelfNumber.trim()) {
      filter.shelfNumber = new RegExp(`^${shelfNumber.trim()}$`, 'i');
    }

    const [books, totalBooks, categories, shelves] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).lean(),
      Book.countDocuments(),
      Book.distinct('category'),
      Book.distinct('shelfNumber')
    ]);

    res.render('admin/dashboard', {
      title: 'Admin Dashboard - Islamic Library',
      books,
      filteredCount: books.length,
      totalBooks,
      totalCategories: categories.length,
      totalShelves: shelves.length,
      categories,
      shelves,
      query: {
        q: q || '',
        category: category || '',
        shelfNumber: shelfNumber || ''
      }
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    req.flash('error', 'Error loading books. Please check database connection.');
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      books: [],
      filteredCount: 0,
      totalBooks: 0,
      totalCategories: 0,
      totalShelves: 0,
      categories: [],
      shelves: [],
      query: {}
    });
  }
};

// Render form to add a new book
const getAddBook = async (req, res) => {
  try {
    const [categories, shelves] = await Promise.all([
      Book.distinct('category'),
      Book.distinct('shelfNumber')
    ]);

    res.render('admin/add-book', {
      title: 'Add New Book - Islamic Library',
      existingCategories: categories,
      existingShelves: shelves,
      formData: {}
    });
  } catch (error) {
    console.error('Error loading add book form:', error);
    res.render('admin/add-book', {
      title: 'Add New Book',
      existingCategories: [],
      existingShelves: [],
      formData: {}
    });
  }
};

// Handle adding a new book
const postAddBook = async (req, res) => {
  const { bookName, author, category, libraryCode, shelfNumber } = req.body;

  try {
    // Basic validation
    if (!bookName || !author || !category || !libraryCode || !shelfNumber) {
      req.flash('error', 'All fields are required. Please fill in all details.');
      const [categories, shelves] = await Promise.all([
        Book.distinct('category'),
        Book.distinct('shelfNumber')
      ]);
      return res.render('admin/add-book', {
        title: 'Add New Book',
        existingCategories: categories,
        existingShelves: shelves,
        formData: req.body
      });
    }

    // Check if library code already exists
    const normalizedCode = libraryCode.trim().toUpperCase();
    const existing = await Book.findOne({ libraryCode: normalizedCode });
    if (existing) {
      req.flash('error', `Library Code "${normalizedCode}" is already in use by "${existing.bookName}". Please use a unique code.`);
      const [categories, shelves] = await Promise.all([
        Book.distinct('category'),
        Book.distinct('shelfNumber')
      ]);
      return res.render('admin/add-book', {
        title: 'Add New Book',
        existingCategories: categories,
        existingShelves: shelves,
        formData: req.body
      });
    }

    // Create and save new book
    const newBook = new Book({
      bookName: bookName.trim(),
      author: author.trim(),
      category: category.trim(),
      libraryCode: normalizedCode,
      shelfNumber: shelfNumber.trim().toUpperCase()
    });

    await newBook.save();
    req.flash('success', `Book "${newBook.bookName}" successfully added to Shelf ${newBook.shelfNumber}!`);
    return res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error adding book:', error);
    req.flash('error', `Failed to add book: ${error.message}`);
    return res.redirect('/admin/books/new');
  }
};

// Render form to edit an existing book
const getEditBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/admin/dashboard');
    }

    const [categories, shelves] = await Promise.all([
      Book.distinct('category'),
      Book.distinct('shelfNumber')
    ]);

    res.render('admin/edit-book', {
      title: `Edit: ${book.bookName} - Islamic Library`,
      book,
      existingCategories: categories,
      existingShelves: shelves
    });
  } catch (error) {
    console.error('Error retrieving book for edit:', error);
    req.flash('error', 'Unable to retrieve book.');
    res.redirect('/admin/dashboard');
  }
};

// Handle updating an existing book
const putEditBook = async (req, res) => {
  const { bookName, author, category, libraryCode, shelfNumber } = req.body;
  const bookId = req.params.id;

  try {
    if (!bookName || !author || !category || !libraryCode || !shelfNumber) {
      req.flash('error', 'All fields are required.');
      return res.redirect(`/admin/books/${bookId}/edit`);
    }

    const normalizedCode = libraryCode.trim().toUpperCase();

    // Ensure library code is not in use by another book
    const existingCodeBook = await Book.findOne({
      libraryCode: normalizedCode,
      _id: { $ne: bookId }
    });

    if (existingCodeBook) {
      req.flash('error', `Library Code "${normalizedCode}" is already in use by "${existingCodeBook.bookName}".`);
      return res.redirect(`/admin/books/${bookId}/edit`);
    }

    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        bookName: bookName.trim(),
        author: author.trim(),
        category: category.trim(),
        libraryCode: normalizedCode,
        shelfNumber: shelfNumber.trim().toUpperCase()
      },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      req.flash('error', 'Book not found.');
      return res.redirect('/admin/dashboard');
    }

    req.flash('success', `Book "${updatedBook.bookName}" updated successfully.`);
    return res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error updating book:', error);
    req.flash('error', `Failed to update book: ${error.message}`);
    return res.redirect(`/admin/books/${bookId}/edit`);
  }
};

// Handle deleting a book
const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    if (!deletedBook) {
      req.flash('error', 'Book not found.');
      return res.redirect('/admin/dashboard');
    }

    req.flash('success', `Book "${deletedBook.bookName}" (Code: ${deletedBook.libraryCode}) was deleted successfully.`);
    return res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error deleting book:', error);
    req.flash('error', `Failed to delete book: ${error.message}`);
    res.redirect('/admin/dashboard');
  }
};

// Download Sample / Demo CSV Template File
const downloadSampleCsv = (req, res) => {
  const csvData = getSampleCsvContent();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="sample_books_template.csv"');
  return res.send(csvData);
};

// Render CSV Import Page
const getImportCsvPage = (req, res) => {
  res.render('admin/import-csv', {
    title: 'Import Books via CSV - Islamic Library'
  });
};

// Handle CSV File Upload & Processing
const postImportCsv = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    req.flash('error', 'Please select a valid CSV file to upload.');
    return res.redirect('/admin/books/import');
  }

  try {
    const csvContent = req.file.buffer.toString('utf8');
    const records = parseCsvString(csvContent);

    if (!records || records.length === 0) {
      req.flash('error', 'No valid book records found in the uploaded CSV file. Please check format.');
      return res.redirect('/admin/books/import');
    }

    let insertedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    const errors = [];

    const handleDuplicate = req.body.duplicateAction || 'skip'; // 'skip' or 'update'

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2; // header is row 1

      // Validate required fields
      if (!row.bookName || !row.author || !row.category || !row.libraryCode || !row.shelfNumber) {
        skippedCount++;
        errors.push(`Row ${rowNum}: Incomplete fields for "${row.bookName || 'Unknown'}"`);
        continue;
      }

      const normalizedCode = row.libraryCode.trim().toUpperCase();
      const existing = await Book.findOne({ libraryCode: normalizedCode });

      if (existing) {
        if (handleDuplicate === 'update') {
          existing.bookName = row.bookName.trim();
          existing.author = row.author.trim();
          existing.category = row.category.trim();
          existing.shelfNumber = row.shelfNumber.trim().toUpperCase();
          await existing.save();
          updatedCount++;
        } else {
          skippedCount++;
          errors.push(`Row ${rowNum}: Code "${normalizedCode}" already in use`);
        }
      } else {
        const newBook = new Book({
          bookName: row.bookName.trim(),
          author: row.author.trim(),
          category: row.category.trim(),
          libraryCode: normalizedCode,
          shelfNumber: row.shelfNumber.trim().toUpperCase()
        });
        await newBook.save();
        insertedCount++;
      }
    }

    let message = `CSV Import completed: ${insertedCount} new books added.`;
    if (updatedCount > 0) message += ` ${updatedCount} books updated.`;
    if (skippedCount > 0) message += ` ${skippedCount} rows skipped.`;

    if (insertedCount > 0 || updatedCount > 0) {
      req.flash('success', message);
    } else {
      req.flash('error', message + ' No new books were added.');
    }

    return res.redirect('/admin/dashboard');
  } catch (error) {
    console.error('Error processing CSV import:', error);
    req.flash('error', `CSV Processing failed: ${error.message}`);
    return res.redirect('/admin/books/import');
  }
};

module.exports = {
  getDashboard,
  getAddBook,
  postAddBook,
  getEditBook,
  putEditBook,
  deleteBook,
  downloadSampleCsv,
  getImportCsvPage,
  postImportCsv
};
