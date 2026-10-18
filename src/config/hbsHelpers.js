// Custom Handlebars helper functions
const helpers = {
  // Equality comparison
  eq: function (a, b) {
    return a === b;
  },

  // Logical OR helper
  or: function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.some(Boolean);
  },

  // Logical AND helper
  and: function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(Boolean);
  },

  // Check if string contains substring
  contains: function (str, substring) {
    if (!str) return false;
    return str.toString().includes(substring);
  },

  // 1-based indexing for tables
  inc: function (value) {
    return parseInt(value, 10) + 1;
  },

  // Format date nicely
  formatDate: function (date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Default value helper
  defaultVal: function (value, fallback) {
    return value || fallback;
  }
};

module.exports = helpers;
