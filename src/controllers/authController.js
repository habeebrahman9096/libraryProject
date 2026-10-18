const Credential = require('../models/Credential');

// Authentication controller for library administration
const getLoginPage = (req, res) => {
  res.render('admin/login', {
    title: 'Admin Sign In - Islamic Library',
    layout: 'main'
  });
};

const postLogin = async (req, res) => {
  const { username, password } = req.body;

  const cleanUsername = (username || '').trim();
  const cleanPassword = (password || '').trim();

  if (!cleanUsername || !cleanPassword) {
    req.flash('error', 'Please provide both username and password.');
    return res.redirect('/admin/login');
  }

  try {
    // Look up credentials in the CREDINTIALS collection
    let credential = await Credential.findOne({ username: cleanUsername });

    // If not found, check if collection is empty; if so, seed from environment variables
    if (!credential) {
      const totalCreds = await Credential.countDocuments();
      if (totalCreds === 0) {
        await Credential.getOrSeedInitialAdmin();
        credential = await Credential.findOne({ username: cleanUsername });
      }
    }

    // Check credentials if found in CREDINTIALS collection
    if (credential) {
      const isMatch = await credential.comparePassword(cleanPassword);
      if (isMatch) {
        req.session.isAuthenticated = true;
        req.session.adminUsername = credential.username;
        req.session.adminId = credential._id;

        return req.session.save((err) => {
          if (err) {
            console.warn('[Session Save Warning]: Persistent store error, proceeding:', err.message);
          }
          req.flash('success', `Welcome back, ${credential.username}! Logged in successfully.`);
          return res.redirect('/admin/dashboard');
        });
      }
    }

    // Fallback: check directly against .env variables if database was not yet seeded or unreachable
    const expectedUser = (process.env.ADMIN_USERNAME || 'admin').trim().replace(/^["']|["']$/g, '');
    const expectedPass = (process.env.ADMIN_PASSWORD || 'admin123').trim().replace(/^["']|["']$/g, '');

    if (cleanUsername === expectedUser && cleanPassword === expectedPass) {
      req.session.isAuthenticated = true;
      req.session.adminUsername = cleanUsername;

      // Ensure credential is saved into CREDINTIALS for future logins
      try {
        const existing = await Credential.findOne({ username: cleanUsername });
        if (!existing) {
          const newCred = new Credential({ username: cleanUsername, password: cleanPassword });
          await newCred.save();
        }
      } catch (dbErr) {
        console.warn('Could not auto-seed into CREDINTIALS:', dbErr.message);
      }

      return req.session.save((err) => {
        if (err) {
          console.warn('[Session Save Warning]:', err.message);
        }
        req.flash('success', `Welcome back, ${cleanUsername}! Logged in successfully.`);
        return res.redirect('/admin/dashboard');
      });
    }

    req.flash('error', 'Invalid username or password. Please verify your credentials.');
    return res.redirect('/admin/login');
  } catch (error) {
    console.error('Login error:', error);
    req.flash('error', 'Authentication failed. Please check database connection.');
    return res.redirect('/admin/login');
  }
};

// Render Admin Settings / Change Credentials Page
const getSettingsPage = async (req, res) => {
  try {
    let credential = null;
    if (req.session.adminId) {
      credential = await Credential.findById(req.session.adminId);
    }
    if (!credential) {
      credential = await Credential.findOne({ username: req.session.adminUsername });
    }
    if (!credential) {
      credential = await Credential.getOrSeedInitialAdmin();
    }

    const currentAdminUser = credential ? credential.username : (req.session.adminUsername || 'admin');

    res.render('admin/settings', {
      title: 'Admin Credentials & Settings - Islamic Library',
      currentAdminUser
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.render('admin/settings', {
      title: 'Admin Settings',
      currentAdminUser: req.session.adminUsername || 'admin'
    });
  }
};

// Handle changing admin username and password (saved in CREDINTIALS collection)
const postChangeCredentials = async (req, res) => {
  const { currentPassword, newUsername, newPassword, confirmPassword } = req.body;

  const cleanCurrentPass = (currentPassword || '').trim();
  const cleanNewUser = (newUsername || '').trim();
  const cleanNewPass = (newPassword || '').trim();
  const cleanConfirmPass = (confirmPassword || '').trim();

  if (!cleanCurrentPass) {
    req.flash('error', 'Current password is required to authorize credentials update.');
    return res.redirect('/admin/settings');
  }

  if (!cleanNewUser) {
    req.flash('error', 'New username cannot be empty.');
    return res.redirect('/admin/settings');
  }

  // If user wants to change password, validate match
  if (cleanNewPass || cleanConfirmPass) {
    if (cleanNewPass !== cleanConfirmPass) {
      req.flash('error', 'New password and confirmation password do not match.');
      return res.redirect('/admin/settings');
    }
    if (cleanNewPass.length < 4) {
      req.flash('error', 'New password should be at least 4 characters long.');
      return res.redirect('/admin/settings');
    }
  }

  try {
    // Find current credential record
    let credential = null;
    if (req.session.adminId) {
      credential = await Credential.findById(req.session.adminId);
    }
    if (!credential) {
      credential = await Credential.findOne({ username: req.session.adminUsername });
    }
    if (!credential) {
      credential = await Credential.getOrSeedInitialAdmin();
    }

    // Verify current password
    let isCurrentValid = false;
    if (credential) {
      isCurrentValid = await credential.comparePassword(cleanCurrentPass);
    }

    // Fallback: check if matches .env password if database had not been updated yet
    if (!isCurrentValid) {
      const envPass = (process.env.ADMIN_PASSWORD || 'admin123').trim().replace(/^["']|["']$/g, '');
      if (cleanCurrentPass === envPass) {
        isCurrentValid = true;
      }
    }

    if (!isCurrentValid) {
      req.flash('error', 'Current password entered is incorrect.');
      return res.redirect('/admin/settings');
    }

    // Check if new username is already taken by another credential
    if (credential && cleanNewUser !== credential.username) {
      const existingUser = await Credential.findOne({
        username: cleanNewUser,
        _id: { $ne: credential._id }
      });
      if (existingUser) {
        req.flash('error', `Username "${cleanNewUser}" is already taken.`);
        return res.redirect('/admin/settings');
      }
    }

    // If no credential record existed in collection, create one
    if (!credential) {
      credential = new Credential({
        username: cleanNewUser,
        password: cleanNewPass || cleanCurrentPass
      });
    } else {
      credential.username = cleanNewUser;
      if (cleanNewPass) {
        credential.password = cleanNewPass; // will be hashed by pre('save') hook
      }
    }

    await credential.save();
    console.log(`[Credentials] Successfully updated CREDINTIALS collection for user: ${cleanNewUser}`);

    // Update active session with new username
    req.session.adminUsername = credential.username;
    req.session.adminId = credential._id;

    req.session.save((err) => {
      if (err) {
        console.warn('Session save warning after cred update:', err.message);
      }
      req.flash('success', `Credentials updated successfully! Saved in CREDINTIALS collection.`);
      return res.redirect('/admin/settings');
    });
  } catch (error) {
    console.error('Error updating credentials in CREDINTIALS:', error);
    req.flash('error', `Failed to update credentials: ${error.message}`);
    return res.redirect('/admin/settings');
  }
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
  getSettingsPage,
  postChangeCredentials,
  postLogout
};
