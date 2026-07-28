const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");

/**
 * Creates a new user (email must be unique) and returns the user
 * along with a signed JWT.
 */
const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(400, "Email is already registered");
  }

  const user = await User.create({ name, email, password });

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token: generateToken(user._id),
  };
};

/**
 * Verifies email/password and returns the user along with a signed JWT.
 */
const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  return {
    user: { id: user._id, name: user.name, email: user.email },
    token: generateToken(user._id),
  };
};

module.exports = { registerUser, loginUser };
