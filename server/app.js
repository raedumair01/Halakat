require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_ENV);
const localMongoUri = 'mongodb://localhost:27017/Halakat';
const MONGODB_URI = process.env.MONGODB_URI?.trim() || localMongoUri;
const JWT_SECRET = process.env.JWT_SECRET?.trim() || 'halakat-dev-secret';
const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const AUTH_EMAIL_FROM = process.env.PASSWORD_RESET_FROM_EMAIL?.trim();
const GMAIL_USER = process.env.GMAIL_USER?.trim();
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.trim();

app.use(cors());
app.use(express.json());

function formatLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createEmptyPracticeProgress() {
  return {
    daily: {},
    totals: {
      recitedVerses: 0,
      memorizedVerses: 0,
      retainedVerses: 0,
      reciteSessions: 0,
      memorizeSessions: 0,
      retainSessions: 0,
    },
    updatedAt: new Date().toISOString(),
  };
}

function normalizeDayStats(day, date) {
  return {
    date,
    recitedVerses: day?.recitedVerses ?? 0,
    memorizedVerses: day?.memorizedVerses ?? 0,
    retainedVerses: day?.retainedVerses ?? 0,
    reciteSessions: day?.reciteSessions ?? 0,
    memorizeSessions: day?.memorizeSessions ?? 0,
    retainSessions: day?.retainSessions ?? 0,
    updatedAt: day?.updatedAt ?? new Date().toISOString(),
  };
}

function normalizePracticeProgress(progress) {
  const empty = createEmptyPracticeProgress();
  const source = progress && typeof progress === 'object' ? progress : empty;
  const dailySource = source.daily && typeof source.daily === 'object' ? source.daily : {};
  const daily = {};

  Object.entries(dailySource).forEach(([date, day]) => {
    daily[date] = normalizeDayStats(day, date);
  });

  return {
    daily,
    totals: {
      recitedVerses: source.totals?.recitedVerses ?? 0,
      memorizedVerses: source.totals?.memorizedVerses ?? 0,
      retainedVerses: source.totals?.retainedVerses ?? 0,
      reciteSessions: source.totals?.reciteSessions ?? 0,
      memorizeSessions: source.totals?.memorizeSessions ?? 0,
      retainSessions: source.totals?.retainSessions ?? 0,
    },
    updatedAt: source.updatedAt ?? empty.updatedAt,
  };
}

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
    passwordResetTokenHash: {
      type: String,
      default: null,
    },
    passwordResetExpiresAt: {
      type: Date,
      default: null,
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
    practiceProgress: {
      type: mongoose.Schema.Types.Mixed,
      default: createEmptyPracticeProgress,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

const signupVerificationSchema = new mongoose.Schema(
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
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

const SignupVerification =
  mongoose.models.SignupVerification || mongoose.model('SignupVerification', signupVerificationSchema);

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

function hashOtp(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

async function sendAuthEmailWithGmail({ email, subject, html, text }) {
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: AUTH_EMAIL_FROM || `Halakat <${GMAIL_USER}>`,
      to: email,
      subject,
      html,
      text,
    });
  } catch (cause) {
    const error = new Error(`Gmail email failed: ${cause instanceof Error ? cause.message : 'Unknown error'}`);
    error.code = 'EMAIL_SEND_FAILED';
    error.cause = cause;
    throw error;
  }

  return true;
}

async function sendAuthEmailWithResend({ email, subject, html, text }) {
  if (!RESEND_API_KEY || !AUTH_EMAIL_FROM) {
    return false;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: AUTH_EMAIL_FROM,
      to: [email],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    const error = new Error(`Auth email failed with ${response.status}: ${body}`);
    error.code = 'EMAIL_SEND_FAILED';
    error.status = response.status;
    throw error;
  }

  return true;
}

async function sendAuthEmail(message) {
  const sentWithGmail = await sendAuthEmailWithGmail(message);

  if (sentWithGmail) {
    return true;
  }

  return sendAuthEmailWithResend(message);
}

function renderCodeEmail({ title, intro, code }) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
      <h2 style="color:#0B3D2E">${title}</h2>
      <p>${intro}</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:4px;color:#0B3D2E">${code}</p>
      <p>This code expires in 15 minutes. If you did not request it, you can ignore this email.</p>
    </div>
  `;
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

app.post('/auth/signup/request-otp', async (req, res) => {
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
    const otp = createOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await SignupVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        otpHash: hashOtp(otp),
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const emailSent = await sendAuthEmail({
      email: normalizedEmail,
      subject: 'Your Halakat signup code',
      html: renderCodeEmail({
        title: 'Verify your Halakat account',
        intro: 'Use this code to finish creating your account:',
        code: otp,
      }),
      text: `Your Halakat signup verification code is ${otp}. This code expires in 15 minutes.`,
    });

    const response = { message: 'Verification code sent. Check your email to finish creating your account.' };

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Signup OTP for ${normalizedEmail}: ${otp}`);
      if (!emailSent) {
        response.otp = otp;
      }
    }

    return res.json(response);
  } catch (error) {
    console.error('Signup OTP request failed:', error);
    if (error?.code === 'EMAIL_SEND_FAILED') {
      return res.status(502).json({
        message: 'Unable to send verification email. Please check your Gmail app password or Resend sender setup.',
      });
    }
    return res.status(500).json({ message: 'Unable to send verification code right now.' });
  }
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { email, otp } = req.body ?? {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedOtp = typeof otp === 'string' ? otp.trim() : '';

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    if (!normalizedOtp) {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    const pendingSignup = await SignupVerification.findOne({ email: normalizedEmail });
    const otpExpired = !pendingSignup?.expiresAt || pendingSignup.expiresAt.getTime() < Date.now();

    if (!pendingSignup || otpExpired || pendingSignup.otpHash !== hashOtp(normalizedOtp)) {
      return res.status(400).json({ message: 'Verification code is invalid or has expired.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      await SignupVerification.deleteOne({ email: normalizedEmail });
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({
      fullName: pendingSignup.fullName,
      email: normalizedEmail,
      passwordHash: pendingSignup.passwordHash,
    });
    await SignupVerification.deleteOne({ email: normalizedEmail });

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

app.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body ?? {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    const response = {
      message: 'If an account exists for this email, a reset code has been generated.',
    };

    if (!user) {
      return res.json(response);
    }

    const resetToken = createOtp();
    user.passwordResetTokenHash = hashOtp(resetToken);
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const emailSent = await sendAuthEmail({
      email: normalizedEmail,
      subject: 'Your Halakat password reset code',
      html: renderCodeEmail({
        title: 'Reset your Halakat password',
        intro: 'Use this code to reset your password:',
        code: resetToken,
      }),
      text: `Your Halakat password reset code is ${resetToken}. This code expires in 15 minutes.`,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`Password reset code for ${normalizedEmail}: ${resetToken}`);
      if (!emailSent) {
        response.resetToken = resetToken;
      }
    }

    return res.json(response);
  } catch (error) {
    console.error('Forgot password failed:', error);
    if (error?.code === 'EMAIL_SEND_FAILED') {
      return res.status(502).json({
        message: 'Unable to send reset email. Please check your Gmail app password or Resend sender setup.',
      });
    }
    return res.status(500).json({ message: 'Unable to start password reset right now.' });
  }
});

app.post('/auth/reset-password', async (req, res) => {
  try {
    const { email, resetToken, password } = req.body ?? {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedToken = typeof resetToken === 'string' ? resetToken.trim() : '';

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    if (!normalizedToken) {
      return res.status(400).json({ message: 'Reset code is required.' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    const tokenHash = hashOtp(normalizedToken);
    const tokenExpired = !user?.passwordResetExpiresAt || user.passwordResetExpiresAt.getTime() < Date.now();

    if (!user || !user.passwordResetTokenHash || tokenExpired || user.passwordResetTokenHash !== tokenHash) {
      return res.status(400).json({ message: 'Reset code is invalid or has expired.' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.json({ message: 'Password has been reset. You can now sign in.' });
  } catch (error) {
    console.error('Reset password failed:', error);
    return res.status(500).json({ message: 'Unable to reset password right now.' });
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

app.get('/progress', authMiddleware, async (req, res) => {
  const progress = normalizePracticeProgress(req.user.practiceProgress);

  if (JSON.stringify(progress) !== JSON.stringify(req.user.practiceProgress ?? {})) {
    req.user.practiceProgress = progress;
    await req.user.save();
  }

  return res.json({ progress });
});

app.post('/progress/activity', authMiddleware, async (req, res) => {
  try {
    const { type, versesCompleted, date } = req.body ?? {};
    const activityType = typeof type === 'string' ? type.trim() : '';
    const count = Number(versesCompleted);
    const activityDate = typeof date === 'string' ? date.trim() : '';

    if (!['recite', 'memorize', 'retain'].includes(activityType)) {
      return res.status(400).json({ message: 'Activity type must be recite, memorize, or retain.' });
    }

    if (!Number.isFinite(count) || count <= 0) {
      return res.status(400).json({ message: 'Verses completed must be a positive number.' });
    }

    if (activityDate && !/^\d{4}-\d{2}-\d{2}$/.test(activityDate)) {
      return res.status(400).json({ message: 'Date must use YYYY-MM-DD format.' });
    }

    const verses = Math.max(1, Math.round(count));
    const today = activityDate || formatLocalIsoDate(new Date());
    const now = new Date().toISOString();
    const progress = normalizePracticeProgress(req.user.practiceProgress);
    const currentDay = normalizeDayStats(progress.daily[today], today);

    if (activityType === 'recite') {
      currentDay.recitedVerses += verses;
      currentDay.reciteSessions += 1;
      progress.totals.recitedVerses += verses;
      progress.totals.reciteSessions += 1;
    }

    if (activityType === 'memorize') {
      currentDay.memorizedVerses += verses;
      currentDay.memorizeSessions += 1;
      progress.totals.memorizedVerses += verses;
      progress.totals.memorizeSessions += 1;
      req.user.memorizedVerses = (req.user.memorizedVerses ?? 0) + verses;
    }

    if (activityType === 'retain') {
      currentDay.retainedVerses += verses;
      currentDay.retainSessions += 1;
      progress.totals.retainedVerses += verses;
      progress.totals.retainSessions += 1;
    }

    currentDay.updatedAt = now;
    progress.daily[today] = currentDay;
    progress.updatedAt = now;
    req.user.practiceProgress = progress;

    await req.user.save();
    return res.json({ progress, user: formatUser(req.user) });
  } catch (error) {
    console.error('Progress update failed:', error);
    return res.status(500).json({ message: 'Unable to update progress right now.' });
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
