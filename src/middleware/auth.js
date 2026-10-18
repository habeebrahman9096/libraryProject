// Authentication middleware for protecting admin endpoints
const requireAuth = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return next();
  }
  
  req.flash('error', 'Please log in to access the administration panel.');
  return res.redirect('/admin/login');
};

// Middleware to redirect already logged-in users away from the login page
const forwardAuthenticated = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/admin/dashboard');
  }
  return next();
};

// Middleware to make authentication state & session accessible to all templates
const setTemplateLocals = (req, res, next) => {
  res.locals.isAuthenticated = Boolean(req.session && req.session.isAuthenticated);
  res.locals.adminUsername = (req.session && req.session.adminUsername) || null;
  res.locals.currentPath = req.path;
  res.locals.successMsg = req.flash('success');
  res.locals.errorMsg = req.flash('error');
  res.locals.infoMsg = req.flash('info');
  next();
};

module.exports = {
  requireAuth,
  forwardAuthenticated,
  setTemplateLocals
};
