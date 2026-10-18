const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const credentialSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    }
  },
  {
    // Explicitly target the CREDINTIALS collection as requested
    collection: 'CREDINTIALS',
    timestamps: true
  }
);

// Hash password before saving if modified
credentialSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
credentialSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    // Check if the stored password looks like a bcrypt hash ($2a$ or $2b$)
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      return await bcrypt.compare(candidatePassword, this.password);
    }
    // Fallback for plain-text comparison
    return candidatePassword === this.password;
  } catch (err) {
    console.error('Password comparison error:', err);
    return false;
  }
};

// Static helper to get primary admin or seed from environment variables
credentialSchema.statics.getOrSeedInitialAdmin = async function () {
  try {
    let admin = await this.findOne();
    if (!admin) {
      const defaultUser = (process.env.ADMIN_USERNAME || 'admin').trim().replace(/^["']|["']$/g, '');
      const defaultPass = (process.env.ADMIN_PASSWORD || 'admin123').trim().replace(/^["']|["']$/g, '');

      admin = new this({
        username: defaultUser,
        password: defaultPass
      });
      await admin.save();
      console.log(`[Credentials] Initialized CREDINTIALS collection with default admin: ${defaultUser}`);
    }
    return admin;
  } catch (err) {
    console.error('Error fetching/seeding admin credentials:', err.message);
    return null;
  }
};

const Credential = mongoose.model('Credential', credentialSchema);

module.exports = Credential;
