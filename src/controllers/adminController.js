const Book = require('../models/Book');

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

module.exports = {
  getDashboard,
  getAddBook,
  postAddBook,
  getEditBook,
  putEditBook,
  deleteBook
};
