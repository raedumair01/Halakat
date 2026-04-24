require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const localMongoUri = 'mongodb://localhost:27017/Halakat';
const MONGODB_URI = process.env.MONGODB_URI?.trim() || localMongoUri;
const JWT_SECRET = process.env.JWT_SECRET?.trim() || 'halakat-dev-secret';

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: 'Building a consistent Quran routine with Halakat.',
      trim: true,
    },
    location: {
      type: String,
      default: 'Halakat Community',
      trim: true,
    },
    streakGoal: {
      type: Number,
      default: 30,
      min: 1,
      max: 365,
    },
    circlesJoined: {
      type: Number,
      default: 1,
      min: 0,
    },
    memorizedVerses: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function formatUser(user) {
  return {
    id: user._id.toString(),
    fullName: user.fullName,
    email: user.email,
    bio: user.bio,
    location: user.location,
    streakGoal: user.streakGoal,
    circlesJoined: user.circlesJoined,
    memorizedVerses: user.memorizedVerses,
    memberSince: user.createdAt,
  };
}

async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization token.' });
  }

  try {
    const token = authorization.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Session is no longer valid.' });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid authorization token.' });
  }
}

app.get('/', (_req, res) => {
  res.json({ ok: true, service: 'Halakat API' });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, database: 'Halakat' });
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body ?? {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!fullName?.trim()) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = createToken(user._id.toString());
    return res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    console.error('Signup failed:', error);
    return res.status(500).json({ message: 'Unable to create account right now.' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    const token = createToken(user._id.toString());
    return res.json({ token, user: formatUser(user) });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ message: 'Unable to log in right now.' });
  }
});

app.get('/auth/profile', authMiddleware, async (req, res) => {
  return res.json({ user: formatUser(req.user) });
});

app.patch('/auth/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body ?? {};

    if (typeof updates.fullName === 'string' && updates.fullName.trim()) {
      req.user.fullName = updates.fullName.trim();
    }

    if (typeof updates.bio === 'string') {
      req.user.bio = updates.bio.trim().slice(0, 180);
    }

    if (typeof updates.location === 'string') {
      req.user.location = updates.location.trim().slice(0, 60);
    }

    if (typeof updates.streakGoal === 'number' && Number.isFinite(updates.streakGoal)) {
      req.user.streakGoal = Math.min(365, Math.max(1, Math.round(updates.streakGoal)));
    }

    await req.user.save();
    return res.json({ user: formatUser(req.user) });
  } catch (error) {
    console.error('Profile update failed:', error);
    return res.status(500).json({ message: 'Unable to update profile right now.' });
  }
});

let cachedConnection = global.__halakatMongoConnection;

function validateRuntimeConfig() {
  if (isVercel && (!process.env.MONGODB_URI || MONGODB_URI === localMongoUri)) {
    throw new Error('Missing Vercel MONGODB_URI. Set a hosted MongoDB connection string in the Vercel project environment variables.');
  }

  if (isVercel && (!process.env.JWT_SECRET || JWT_SECRET === 'halakat-dev-secret')) {
    throw new Error('Missing Vercel JWT_SECRET. Set a secure JWT secret in the Vercel project environment variables.');
  }
}

async function connectToDatabase() {
  validateRuntimeConfig();

  if (!cachedConnection) {
    cachedConnection = mongoose.connect(MONGODB_URI);
    global.__halakatMongoConnection = cachedConnection;
  }

  await cachedConnection;
}

module.exports = {
  app,
  connectToDatabase,
};
