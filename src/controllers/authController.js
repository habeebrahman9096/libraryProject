// Authentication controller for library administration
const getLoginPage = (req, res) => {
  res.render('admin/login', {
    title: 'Admin Sign In - Islamic Library',
    layout: 'main'
  });
};

const postLogin = (req, res) => {
  const { username, password } = req.body;

  const envUsername = process.env.ADMIN_USERNAME || 'admin';
  const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!username || !password) {
    req.flash('error', 'Please provide both username and password.');
    return res.redirect('/admin/login');
  }

  // Validate credentials against environment variables
  if (username.trim() === envUsername && password === envPassword) {
    req.session.isAuthenticated = true;
    req.session.adminUsername = username.trim();
    
    req.flash('success', `Welcome back, ${username.trim()}! Logged in successfully.`);
    return res.redirect('/admin/dashboard');
  }

  req.flash('error', 'Invalid username or password. Please verify credentials.');
  return res.redirect('/admin/login');
};

const postLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session on logout:', err);
    }
    const sessionCookieName = process.env.SESSION_NAME || 'LIBRARY_SESSION';
    res.clearCookie(sessionCookieName);
    res.redirect('/admin/login');
  });
};

module.exports = {
  getLoginPage,
  postLogin,
  postLogout
};
