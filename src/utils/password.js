const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain text password with hashed password
 * @param {string} plainText
 * @param {string} hashed
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plainText, hashed) => {
  return bcrypt.compare(plainText, hashed);
};

module.exports = {
  hashPassword,
  comparePassword,
};
