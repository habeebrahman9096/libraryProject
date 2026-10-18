const Book = require('../models/Book');

// Public book search and catalogue controller
const getHomePage = async (req, res) => {
  try {
    const { q, category, shelfNumber, author, sort } = req.query;

    // Build flexible query filter - all fields are completely optional
    const filter = {};

    // Universal quick search: searches book name, author, category, code, shelf
    if (q && q.trim()) {
      const cleanQ = q.trim();
      const searchRegex = new RegExp(cleanQ, 'i');
      filter.$or = [
        { bookName: searchRegex },
        { author: searchRegex },
        { category: searchRegex },
        { libraryCode: searchRegex },
        { shelfNumber: searchRegex }
      ];
    }

    // Optional specific filters
    if (category && category.trim()) {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }

    if (shelfNumber && shelfNumber.trim()) {
      filter.shelfNumber = new RegExp(`^${shelfNumber.trim()}$`, 'i');
    }

    if (author && author.trim()) {
      filter.author = new RegExp(author.trim(), 'i');
    }

    // Determine sorting
    let sortOption = { createdAt: -1 }; // default newest first
    if (sort === 'title_asc') sortOption = { bookName: 1 };
    if (sort === 'title_desc') sortOption = { bookName: -1 };
    if (sort === 'author_asc') sortOption = { author: 1 };
    if (sort === 'shelf_asc') sortOption = { shelfNumber: 1, bookName: 1 };

    // Fetch matched books
    const books = await Book.find(filter).sort(sortOption).lean();

    // Fetch distinct categories and shelf numbers for the filter dropdowns
    const [allCategories, allShelves] = await Promise.all([
      Book.distinct('category'),
      Book.distinct('shelfNumber')
    ]);

    // Sort the dropdown options cleanly
    allCategories.sort((a, b) => a.localeCompare(b));
    allShelves.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    // Check if any filter is currently active
    const hasActiveFilters = Boolean(
      (q && q.trim()) ||
      (category && category.trim()) ||
      (shelfNumber && shelfNumber.trim()) ||
      (author && author.trim())
    );

    res.render('public/index', {
      title: 'Find Books & Shelf Locations',
      books,
      totalCount: books.length,
      categories: allCategories,
      shelves: allShelves,
      query: {
        q: q || '',
        category: category || '',
        shelfNumber: shelfNumber || '',
        author: author || '',
        sort: sort || 'newest'
      },
      hasActiveFilters
    });
  } catch (error) {
    console.error('Error fetching books for public catalogue:', error);
    res.render('public/index', {
      title: 'Islamic Library Catalogue',
      books: [],
      totalCount: 0,
      categories: [],
      shelves: [],
      query: {},
      hasActiveFilters: false,
      dbError: 'Could not connect to library database. Please ensure MongoDB is running.'
    });
  }
};

// View single book details
const getBookDetails = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).lean();
    if (!book) {
      req.flash('error', 'Book not found.');
      return res.redirect('/');
    }

    // Fetch other books on the same shelf
    const sameShelfBooks = await Book.find({
      shelfNumber: book.shelfNumber,
      _id: { $ne: book._id }
    })
      .limit(6)
      .lean();

    res.render('public/book-details', {
      title: `${book.bookName} - Shelf ${book.shelfNumber}`,
      book,
      sameShelfBooks
    });
  } catch (error) {
    console.error('Error viewing book details:', error);
    req.flash('error', 'Unable to retrieve book details.');
    res.redirect('/');
  }
};

module.exports = {
  getHomePage,
  getBookDetails
};
