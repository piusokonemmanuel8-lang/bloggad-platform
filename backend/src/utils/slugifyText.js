const slugify = require('slugify');

function slugifyText(value = '') {
  return slugify(String(value).trim(), {
    lower: true,
    strict: true,
    trim: true,
  });
}

module.exports = slugifyText;