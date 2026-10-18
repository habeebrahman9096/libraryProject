// Authentication controller for library administration
const getLoginPage = (req, res) => {
  res.render('admin/login', {
    title: 'Admin Sign In - Islamic Library',
    layout: 'main'
  });
};

const postLogin = (req, res) => {
  const { username, password } = req.body;

  // Sanitize input and environment credentials (strip quotes, whitespace)
  const cleanUsername = (username || '').trim();
  const cleanPassword = (password || '').trim();
  const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim().replace(/^["']|["']$/g, '');
  const expectedPass = (process.env.ADMIN_PASSWORD || 'admin123').trim().replace(/^["']|["']$/g, '');

  if (!cleanUsername || !cleanPassword) {
    req.flash('error', 'Please provide both username and password.');
    return res.redirect('/admin/login');
  }

  // Validate credentials against environment variables
  if (cleanUsername === expectedUser && cleanPassword === expectedPass) {
    req.session.isAuthenticated = true;
    req.session.adminUsername = cleanUsername;

    // Explicitly persist session BEFORE sending redirect response
    return req.session.save((err) => {
      if (err) {
        console.warn('[Session Save Warning]: Persistent store error, proceeding with session:', err.message);
      }
      req.flash('success', `Welcome back, ${cleanUsername}! Logged in successfully.`);
      return res.redirect('/admin/dashboard');
    });
  }

  req.flash('error', 'Invalid username or password. Please verify your credentials.');
  return res.redirect('/admin/login');
};

const postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session on logout:', err);
    }
    const sessionCookieName = process.env.SESSION_NAME || 'LIBRARY_SESSION';
    res.clearCookie(sessionCookieName, { path: '/' });
    res.redirect('/admin/login');
  });
};

module.exports = {
  getLoginPage,
  postLogin,
  postLogout
};
