require('dotenv').config();
const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const connectDB = require('./src/config/db');
const hbsHelpers = require('./src/config/hbsHelpers');
const { setTemplateLocals } = require('./src/middleware/auth');

const publicRoutes = require('./src/routes/publicRoutes');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/islamicLibrary';
const sessionCookieName = process.env.SESSION_NAME || 'LIBRARY_SESSION';
const sessionSecret = process.env.SESSION_SECRET || 'islamic_library_fallback_secret_key_2026';

// Connect to MongoDB Database
connectDB();

// Setup Handlebars Template Engine
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'src/views/layouts'),
    partialsDir: path.join(__dirname, 'src/views/partials'),
    helpers: hbsHelpers,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

// Body Parser & Form Method Overrides (support PUT & DELETE)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Serve Static Assets (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Configure 30-Day Session Storage
// Uses MongoDB via connect-mongo so admin sessions persist for 30 days
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60; // 30 days in seconds

app.use(
  session({
    name: sessionCookieName,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      ttl: THIRTY_DAYS_SEC,
      autoRemove: 'native',
      touchAfter: 24 * 3600 // touch session only once every 24 hours to reduce db writes
    }),
    cookie: {
      maxAge: THIRTY_DAYS_MS,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  })
);

// Connect-Flash for Notifications
app.use(flash());

// Global Template Locals (Auth status, user info, alerts, paths)
app.use(setTemplateLocals);

// Mount Application Routes
app.use('/', publicRoutes);
app.use('/admin', authRoutes);
app.use('/admin', adminRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('public/index', {
    title: '404 - Page Not Found',
    books: [],
    totalCount: 0,
    categories: [],
    shelves: [],
    query: {},
    hasActiveFilters: false,
    errorMsg: ['The requested page could not be found.']
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(500).render('public/index', {
    title: '500 - Server Error',
    books: [],
    totalCount: 0,
    categories: [],
    shelves: [],
    query: {},
    hasActiveFilters: false,
    errorMsg: ['An unexpected error occurred. Please try again.']
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(` Islamic Library Portal is running!`);
  console.log(` Public URL:  http://localhost:${PORT}`);
  console.log(` Admin Login: http://localhost:${PORT}/admin/login`);
  console.log(` Database:    ${mongoUri}`);
  console.log(` Session ID:  ${sessionCookieName} (30 days validity)`);
  console.log('====================================================');
});

module.exports = app;
