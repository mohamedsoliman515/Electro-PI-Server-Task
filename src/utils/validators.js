const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates register payload: { name, email, password }.
 * Returns an array of error strings (empty array = valid).
 */
const validateRegisterInput = ({ name, email, password }) => {
  const errors = [];

  if (!name || !name.trim()) errors.push("Name is required");

  if (!email || !email.trim()) {
    errors.push("Email is required");
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.push("Email must be a valid email address");
  }

  if (!password) {
    errors.push("Password is required");
  } else if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
};
const validateLoginInput = ({ email, password }) => {
  const errors = [];
  if (!email || !email.trim()) errors.push("Email is required");
  if (!password) errors.push("Password is required");
  return errors;
};
const validateTaskInput = ({ title }) => {
  const errors = [];
  if (!title || !title.trim()) errors.push("Title is required");
  return errors;
};

module.exports = { validateRegisterInput, validateLoginInput, validateTaskInput };
