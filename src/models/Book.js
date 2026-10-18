const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: [true, 'Book name is required'],
      trim: true,
      index: true
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      index: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    libraryCode: {
      type: String,
      required: [true, 'Library code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    shelfNumber: {
      type: String,
      required: [true, 'Shelf number is required'],
      trim: true,
      uppercase: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for powerful quick search across all key book properties
bookSchema.index({
  bookName: 'text',
  author: 'text',
  category: 'text',
  libraryCode: 'text',
  shelfNumber: 'text'
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
