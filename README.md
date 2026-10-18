# Islamic Library Management & Shelf Locator System

A modern, responsive, and scalable library web application built with **MongoDB**, **Node.js Express**, and **Handlebars (HBS)**. Designed with a clean, high-readability white theme to help library patrons quickly find books and their exact physical shelf locations, while providing administrators with secure 30-day authenticated tools to add, edit, and delete catalogue entries.

---

## Key Features

### 1. Public Book & Shelf Finder (User Area - No Login Required)
* **Instant Universal Search**: Search across book title, author, category, library code, or shelf number in a single bar.
* **Fully Optional Multi-Filters**: Filter by category dropdown, exact shelf number dropdown, author, or sort order.
* **Prominent Shelf Location Badges**: High-contrast, visual shelf badges (e.g., `Shelf: A-1`) so readers immediately know which physical stack to visit.
* **Neighboring Volumes**: Viewing a book highlights other books resting on the exact same shelf.
* **Multilingual Unicode Support**: Fully supports Arabic, English, Malayalam, and Urdu titles and scholar names.

### 2. Administrative Control Panel (Protected Area)
* **Secure Authentication**: Protected via credentials configured in `.env`.
* **Persistent 30-Day Session**: Sessions are named `LIBRARY_SESSION` and stored in MongoDB using `connect-mongo`, ensuring logins survive server restarts for 30 days.
* **Complete CRUD**:
  * **Add Book**: Add books with validation for Book Name, Author, Category, unique Library Code, and Shelf Number.
  * **Edit Book**: Update book details or reassign shelf locations with pre-filled forms.
  * **Delete Book**: Remove obsolete entries with confirmation safeguards.
* **Duplicate Prevention**: Enforces unique library catalog codes.
* **Inventory Overview**: View counts of total books, active shelves, and categories.

### 3. Clean White Theme & Scalable Architecture
* **Pure White Aesthetic**: High-contrast typography, subtle borders, soft shadows, and clean slate tones.
* **Mobile-First Responsive Design**: Works seamlessly across desktops, laptops, tablets, and smartphones with a collapsible mobile navigation menu.
* **Modular MVC Structure**: Clean separation of models, controllers, routes, views, middleware, and configuration.

---

## Database Schema (`Book`)

Stored in the `islamicLibrary` MongoDB database:

| Field | Type | Description |
|---|---|---|
| `bookName` | String | Full title of the book (required, indexed) |
| `author` | String | Author or scholar name (required, indexed) |
| `category` | String | Subject/genre (e.g., Hadith, Fiqh, Tafsir, Aqeedah) (required, indexed) |
| `libraryCode` | String | Unique catalog tracking code (e.g., `HDTH-001`) (required, unique, uppercase) |
| `shelfNumber` | String | Physical shelf location (e.g., `A-1`, `B-04`) (required, uppercase, indexed) |
| `createdAt` | Date | Timestamp of cataloging |
| `updatedAt` | Date | Timestamp of latest record modification |

---

## Project Structure

```
library-gafoor-usthad/
├── .env                       # Environment configuration (URI, credentials, session)
├── .env.example               # Example template for environment variables
├── package.json               # Node.js dependencies and run scripts
├── server.js                  # Main Express application entry point
├── seed.js                    # Sample dataset seeder script
├── src/
│   ├── config/
│   │   ├── db.js              # Mongoose MongoDB connection
│   │   └── hbsHelpers.js      # Handlebars custom helpers
│   ├── controllers/
│   │   ├── publicController.js # Search and shelf finding logic
│   │   ├── adminController.js  # Add, edit, delete book operations
│   │   └── authController.js   # Sign in, sign out, session handling
│   ├── middleware/
│   │   └── auth.js            # Authentication gatekeeper & view locals
│   ├── models/
│   │   └── Book.js            # Mongoose schema and compound text index
│   ├── routes/
│   │   ├── publicRoutes.js    # Routes for / and /books/:id
│   │   ├── adminRoutes.js     # Protected /admin/* routes
│   │   └── authRoutes.js      # /admin/login and /admin/logout
│   └── views/
│       ├── layouts/
│       │   └── main.hbs       # Master responsive HTML5 layout
│       ├── partials/
│       │   ├── navbar.hbs     # Site header with mobile menu
│       │   ├── footer.hbs     # Footer component
│       │   └── alerts.hbs     # Flash notification banners
│       ├── public/
│       │   ├── index.hbs      # Search bar, optional filters, shelf cards
│       │   └── book-details.hbs # Book details and shelf neighbors
│       └── admin/
│           ├── login.hbs      # Admin login form
│           ├── dashboard.hbs  # Inventory table & metrics
│           ├── add-book.hbs   # Add book form
│           └── edit-book.hbs  # Edit & delete book form
└── public/
    ├── css/
    │   └── style.css          # White theme CSS rules & responsive queries
    └── js/
        └── main.js            # Client-side mobile nav, alerts, keyboard shortcuts
```

---

## Getting Started

### 1. Configure `.env`
Ensure your `.env` file contains your MongoDB URI and desired admin credentials:

```ini
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/islamicLibrary
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
SESSION_NAME=LIBRARY_SESSION
SESSION_SECRET=islamic_library_super_secret_session_key_2026_secure
```

> **Note**: If using MongoDB Atlas, replace `MONGODB_URI` with your connection string:
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/islamicLibrary?retryWrites=true&w=majority`

### 2. Populate Sample Data (Optional)
Run the built-in database seeder to populate sample books across multiple shelves (`A-1`, `B-1`, `C-1`, etc.):

```bash
npm run seed
```

### 3. Start the Server
Start the production server:
```bash
npm start
```
Or start in development mode with auto-reload:
```bash
npm run dev
```

Visit the application in your browser:
* **Public Search & Shelf Locator**: [http://localhost:3000](http://localhost:3000)
* **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
  * Default Username: `admin`
  * Default Password: `admin123`

---

## Deploying to Vercel

This repository is pre-configured for Vercel deployment with serverless functions and Handlebars template bundling via `vercel.json` and `api/index.js`.

### 1. MongoDB Atlas Setup
Because Vercel runs in a serverless cloud environment:
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)** (required for Vercel's dynamic IP addresses).
3. Under **Database Access**, create a database user and password.
4. Copy your connection string (`mongodb+srv://.../islamicLibrary?retryWrites=true&w=majority`).

### 2. Configure Vercel Environment Variables
In your Vercel Project Dashboard under **Settings > Environment Variables**, add:

| Key | Example Value |
|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.mongodb.net/islamicLibrary?retryWrites=true&w=majority` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `yourSecretAdminPassword` |
| `SESSION_NAME` | `LIBRARY_SESSION` |
| `SESSION_SECRET` | `a_long_random_secret_string_for_sessions` |

### 3. Regarding `npm warn Unknown env config "cache-dir"`
This is a benign deprecation warning emitted by npm inside Vercel's build image when Vercel passes `npm_config_cache_dir`. The repository includes an `.npmrc` and engine configuration to keep builds clean.
