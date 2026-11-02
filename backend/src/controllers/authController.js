const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function createToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function signup(req, res) {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters.',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: 'Server is missing JWT_SECRET. Add it to backend/.env.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    return res.status(201).json({
      message: 'Signup successful',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    // Handle race-condition duplicate email from unique index
    if (error && error.code === 11000) {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    console.error('Signup failed:', error.message);
    return res.status(500).json({
      error: 'Could not create account. Please try again.',
    });
  }
}

async function login(req, res) {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        error: 'Server is missing JWT_SECRET. Add it to backend/.env.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse(user),
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({
      error: 'Could not log in. Please try again.',
    });
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found.',
      });
    }

    return res.status(200).json({
      user: userResponse(user),
    });
  } catch (error) {
    console.error('Get me failed:', error.message);
    return res.status(500).json({
      error: 'Could not load user profile.',
    });
  }
}

module.exports = {
  signup,
  login,
  getMe,
};
