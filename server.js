require('dotenv').config();
const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const { connectDB } = require('./src/config/db');
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

// CRITICAL FOR VERCEL & PROXIES: Trust reverse proxy so HTTPS cookies and redirects work properly
app.set('trust proxy', 1);

// Connect to MongoDB Database
connectDB();

// Ensure DB is connected for incoming requests in serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    // Continue so error messages / graceful fallbacks can render
  }
  next();
});

// Setup Handlebars Template Engine
const viewsDir = path.join(__dirname, 'src', 'views');
app.engine(
  'hbs',
  engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(viewsDir, 'layouts'),
    partialsDir: path.join(viewsDir, 'partials'),
    helpers: hbsHelpers,
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true
    }
  })
);
app.set('view engine', 'hbs');
app.set('views', viewsDir);

// Body Parser & Form Method Overrides (support PUT & DELETE)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Serve Static Assets (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Configure 30-Day Session Storage
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
const THIRTY_DAYS_SEC = 30 * 24 * 60 * 60; // 30 days in seconds

// Build session store: Uses connect-mongo if valid remote DB or local; falls back to MemoryStore if localhost on Vercel
let sessionStore = null;
const isLocalhostUri = mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost');

if (process.env.VERCEL && isLocalhostUri) {
  console.warn('[Vercel Warning] Running on Vercel with localhost MONGODB_URI. Using MemoryStore for sessions.');
} else {
  try {
    sessionStore = MongoStore.create({
      mongoUrl: mongoUri,
      mongoOptions: {
        serverSelectionTimeoutMS: 4000,
        connectTimeoutMS: 4000
      },
      ttl: THIRTY_DAYS_SEC,
      autoRemove: 'native',
      touchAfter: 24 * 3600
    });
    sessionStore.on('error', (err) => {
      console.error('[Session Store Error]:', err.message);
    });
  } catch (e) {
    console.error('[Session Store Init Error]:', e.message);
  }
}

const sessionOptions = {
  name: sessionCookieName,
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: THIRTY_DAYS_MS,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    // When trust proxy is 1, secure: 'auto' automatically sets secure when served over HTTPS (Vercel)
    secure: process.env.NODE_ENV === 'production' && !isLocalhostUri
  }
};

if (sessionStore) {
  sessionOptions.store = sessionStore;
}

app.use(session(sessionOptions));

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

// Start Server locally (only when not running inside Vercel serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(` Islamic Library Portal is running!`);
    console.log(` Public URL:  http://localhost:${PORT}`);
    console.log(` Admin Login: http://localhost:${PORT}/admin/login`);
    console.log(` Database:    ${mongoUri}`);
    console.log(` Session ID:  ${sessionCookieName} (30 days validity)`);
    console.log('====================================================');
  });
}

module.exports = app;
