const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { name, email, password, role } = req.body;

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role === 'organizer' ? 'organizer' : 'user'
      });

      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user & return token
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      res.json({
        success: true,
        token: generateToken(user._id),
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user profile (session check)
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @route   POST /api/auth/logout
// @desc    Logout (client just deletes token; endpoint kept for completeness)
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
