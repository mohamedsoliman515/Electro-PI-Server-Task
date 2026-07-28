const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { validateRegisterInput, validateLoginInput } = require("../utils/validators");
const authService = require("../services/auth.service");

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const errors = validateRegisterInput(req.body);
  if (errors.length) {
    throw new ApiError(400, errors.join(", "));
  }

  const { user, token } = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { user, token },
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const errors = validateLoginInput(req.body);
  if (errors.length) {
    throw new ApiError(400, errors.join(", "));
  }

  const { user, token } = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user, token },
  });
});

module.exports = { register, login };
