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
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash-lite';

app.use(cors());
app.use(express.json({ limit: '15mb' }));

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

const circleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    creatorName: { type: String, required: true, trim: true },
    level: { type: String, default: 'All levels', trim: true },
    pagesPerDay: { type: Number, default: 1, min: 0.25 },
    minutesPerDay: { type: Number, default: 30, min: 5 },
    maxMembers: { type: Number, default: 50, min: 2 },
    memberIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined },
      label: { type: String, default: 'Online circle' },
    },
    isPremium: { type: Boolean, default: false },
  },
  { timestamps: true }
);
circleSchema.index({ location: '2dsphere' });
const Circle = mongoose.models.Circle || mongoose.model('Circle', circleSchema);

const DEFAULT_CIRCLES = [
  { name: 'Quran Savers', creatorName: 'Halakat Community', description: 'A steady circle for building a daily Quran habit.', level: 'All levels', pagesPerDay: 1, minutesPerDay: 20, maxMembers: 50, location: { type: 'Point', coordinates: [67.0011, 24.8607], label: 'Karachi' } },
  { name: 'Yusr Team', creatorName: 'Ahmed Ben Alae', description: 'Supportive memorization with a calm, consistent pace.', level: 'Beginner', pagesPerDay: 2, minutesPerDay: 60, maxMembers: 85, location: { type: 'Point', coordinates: [73.0479, 33.6844], label: 'Islamabad' } },
  { name: 'Hafidon', creatorName: 'Amine Ben Yahya', description: 'Accountability for learners strengthening their hifz.', level: 'Intermediate', pagesPerDay: 1, minutesPerDay: 30, maxMembers: 40, location: { type: 'Point', coordinates: [55.2708, 25.2048], label: 'Dubai' } },
  { name: 'Unique Guys', creatorName: 'Salman Oman', description: 'A welcoming circle for recitation and retention.', level: 'All levels', pagesPerDay: 0.5, minutesPerDay: 20, maxMembers: 30, location: { type: 'Point', coordinates: [58.4059, 23.5880], label: 'Muscat' } },
];

function formatCircle(circle, userId) {
  const members = Array.isArray(circle.memberIds) ? circle.memberIds : [];
  return {
    id: String(circle._id),
    name: circle.name,
    description: circle.description,
    creatorName: circle.creatorName,
    level: circle.level,
    pagesPerDay: circle.pagesPerDay,
    minutesPerDay: circle.minutesPerDay,
    maxMembers: circle.maxMembers,
    memberCount: members.length,
    isMember: Boolean(userId && members.some(member => String(member) === String(userId))),
    isPremium: Boolean(circle.isPremium),
    locationLabel: circle.location?.label || 'Online circle',
    coordinates: circle.location?.coordinates || null,
    createdAt: circle.createdAt,
  };
}

async function ensureDefaultCircles() {
  // Demo circles were used during the initial UI build. Real discovery now
  // comes from Google Places and user-created circles, so never seed demos in
  // a production database.
  return;
}

const LEGACY_DEMO_CIRCLE_NAMES = new Set(DEFAULT_CIRCLES.map(circle => circle.name));
const LEGACY_DEMO_CREATORS = new Set(DEFAULT_CIRCLES.map(circle => circle.creatorName));

function isLegacyDemoCircle(circle) {
  return LEGACY_DEMO_CIRCLE_NAMES.has(circle.name) && LEGACY_DEMO_CREATORS.has(circle.creatorName);
}

// Each login creates a distinct server-side session. Revocation is checked on
// every authenticated request, so logout/password reset takes effect immediately.
const authSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: false, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);
authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const AuthSession = mongoose.models.AuthSession || mongoose.model('AuthSession', authSessionSchema);

// Database-backed fixed-window counters work across serverless instances.
const authRateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  windowStartedAt: { type: Date, required: true },
  count: { type: Number, required: true, default: 0 },
  expiresAt: { type: Date, required: true },
});
authRateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const AuthRateLimit = mongoose.models.AuthRateLimit || mongoose.model('AuthRateLimit', authRateLimitSchema);

function authRateLimit(maxRequests, windowMs = 15 * 60 * 1000) {
  return async (req, res, next) => {
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - windowMs);
      const key = `${req.path}:${req.ip || 'unknown'}`;
      const expiredWindow = {
        $lte: [{ $ifNull: ['$windowStartedAt', new Date(0)] }, cutoff],
      };
      const bucket = await AuthRateLimit.findOneAndUpdate(
        { key },
        [
          {
            $set: {
              windowStartedAt: { $cond: [expiredWindow, now, '$windowStartedAt'] },
              count: {
                $cond: [expiredWindow, 1, { $add: [{ $ifNull: ['$count', 0] }, 1] }],
              },
              expiresAt: {
                $dateAdd: {
                  startDate: { $cond: [expiredWindow, now, '$windowStartedAt'] },
                  unit: 'millisecond',
                  amount: windowMs,
                },
              },
            },
          },
        ],
        { upsert: true, new: true, updatePipeline: true }
      );

      if (bucket.count > maxRequests) {
        res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
        return res.status(429).json({ message: 'Too many attempts. Please wait before trying again.' });
      }

      return next();
    } catch (error) {
      console.error('Authentication rate-limit check failed:', error);
      return res.status(503).json({ message: 'Authentication is temporarily unavailable. Please try again.' });
    }
  };
}

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

async function createAuthSession(userId) {
  const sessionId = crypto.randomUUID();
  const refreshToken = crypto.randomBytes(48).toString('base64url');
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  await AuthSession.create({ sessionId, userId, refreshTokenHash: hashOtp(refreshToken), expiresAt });
  const token = jwt.sign({ userId, sid: sessionId }, JWT_SECRET, { expiresIn: '30d' });

  return { token, refreshToken, sessionId };
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
    if (typeof decoded.sid !== 'string' || typeof decoded.userId !== 'string') {
      return res.status(401).json({ message: 'Session is no longer valid. Please sign in again.' });
    }

    const session = await AuthSession.findOne({
      sessionId: decoded.sid,
      userId: decoded.userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return res.status(401).json({ message: 'Session has expired or been revoked. Please sign in again.' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Session is no longer valid.' });
    }

    req.user = user;
    req.authSessionId = decoded.sid;
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

app.post('/auth/signup/request-otp', authRateLimit(3), async (req, res) => {
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

app.post('/auth/signup', authRateLimit(5), async (req, res) => {
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

    const session = await createAuthSession(user._id.toString());
    return res.status(201).json({ ...session, user: formatUser(user) });
  } catch (error) {
    console.error('Signup failed:', error);
    return res.status(500).json({ message: 'Unable to create account right now.' });
  }
});

app.post('/auth/login', authRateLimit(5), async (req, res) => {
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

    const session = await createAuthSession(user._id.toString());
    return res.json({ ...session, user: formatUser(user) });
  } catch (error) {
    console.error('Login failed:', error);
    return res.status(500).json({ message: 'Unable to log in right now.' });
  }
});

app.post('/auth/forgot-password', authRateLimit(3), async (req, res) => {
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

app.post('/auth/reset-password', authRateLimit(5), async (req, res) => {
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

    // A password reset invalidates every existing device session.
    await AuthSession.updateMany(
      { userId: user._id, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );

    return res.json({ message: 'Password has been reset. Please sign in again on your devices.' });
  } catch (error) {
    console.error('Reset password failed:', error);
    return res.status(500).json({ message: 'Unable to reset password right now.' });
  }
});

app.post('/auth/logout', authMiddleware, async (req, res) => {
  await AuthSession.updateOne(
    { sessionId: req.authSessionId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
  return res.json({ message: 'Signed out successfully.' });
});

app.get('/auth/profile', authMiddleware, async (req, res) => {
  return res.json({ user: formatUser(req.user) });
});

app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken, token: legacyToken } = req.body ?? {};
    let session;

    if (typeof refreshToken === 'string' && refreshToken.length >= 32) {
      session = await AuthSession.findOne({ refreshTokenHash: hashOtp(refreshToken), revokedAt: null, expiresAt: { $gt: new Date() } });
    } else if (typeof legacyToken === 'string') {
      const decoded = jwt.verify(legacyToken, JWT_SECRET);
      if (typeof decoded.sid === 'string' && typeof decoded.userId === 'string') {
        session = await AuthSession.findOne({ sessionId: decoded.sid, userId: decoded.userId, revokedAt: null, expiresAt: { $gt: new Date() } });
      }
    }

    if (!session) return res.status(401).json({ message: 'Refresh token has expired. Please sign in again.' });
    const user = await User.findById(session.userId);
    if (!user) return res.status(401).json({ message: 'Session is no longer valid. Please sign in again.' });

    const nextSession = await createAuthSession(user._id.toString());
    await AuthSession.updateOne({ _id: session._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
    return res.json({ ...nextSession, user: formatUser(user) });
  } catch (error) {
    if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token has expired. Please sign in again.' });
    }
    console.error('Session refresh failed:', error);
    return res.status(500).json({ message: 'Unable to refresh your session right now.' });
  }
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

function circleDistanceKm(latitude1, longitude1, latitude2, longitude2) {
  const earthRadiusKm = 6371;
  const toRadians = value => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(latitude2 - latitude1);
  const deltaLongitude = toRadians(longitude2 - longitude1);
  const a = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(toRadians(latitude1)) * Math.cos(toRadians(latitude2)) * Math.sin(deltaLongitude / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getAllCircles() {
  await ensureDefaultCircles();
  const circles = await Circle.find().sort({ createdAt: -1 }).lean();
  return circles.filter(circle => !isLegacyDemoCircle(circle));
}

async function searchOpenStreetMap(queryText, latitude, longitude, latitudeDelta, longitudeDelta) {
  const query = new URLSearchParams({
    format: 'jsonv2',
    q: queryText,
    viewbox: `${longitude - longitudeDelta},${latitude + latitudeDelta},${longitude + longitudeDelta},${latitude - latitudeDelta}`,
    bounded: '1',
    limit: '30',
    addressdetails: '1',
    'accept-language': 'en',
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${query.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Halakat/1.0 (nearby community discovery)' },
  });
  if (!response.ok) return [];
  const payload = await response.json().catch(() => null);
  return Array.isArray(payload) ? payload : [];
}

app.get('/places/nearby', authMiddleware, async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radiusKm = Math.min(50, Math.max(1, Number(req.query.radiusKm) || 15));
    const searchText = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 80) : '';
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'A valid latitude and longitude are required.' });
    }

    const latitudeDelta = radiusKm / 111;
    const longitudeDelta = radiusKm / (111 * Math.max(0.2, Math.cos((latitude * Math.PI) / 180)));
    const payload = await searchOpenStreetMap(searchText ? `${searchText} mosque` : 'mosque', latitude, longitude, latitudeDelta, longitudeDelta);
    // Some cities tag places as masjid or Islamic centre rather than mosque. Use
    // a small sequential fallback only when the primary search is sparse.
    if (!searchText && payload.length < 5) {
      await new Promise(resolve => setTimeout(resolve, 1100));
      payload.push(...await searchOpenStreetMap('masjid', latitude, longitude, latitudeDelta, longitudeDelta));
      if (payload.length < 5) {
        await new Promise(resolve => setTimeout(resolve, 1100));
        payload.push(...await searchOpenStreetMap('Islamic center', latitude, longitude, latitudeDelta, longitudeDelta));
      }
    }
    const seen = new Set();
    const places = (Array.isArray(payload) ? payload : []).map(place => {
      const latitudeValue = Number(place.lat);
      const longitudeValue = Number(place.lon);
      const id = `osm-${place.osm_type}-${place.osm_id}`;
      const distanceKm = circleDistanceKm(latitude, longitude, latitudeValue, longitudeValue);
      if (seen.has(id) || !Number.isFinite(latitudeValue) || !Number.isFinite(longitudeValue)) return null;
      if (distanceKm > radiusKm) return null;
      seen.add(id);
      return {
        id,
        name: place.name || 'Mosque or Islamic center',
        address: place.display_name || 'Address listed on OpenStreetMap',
        latitude: latitudeValue,
        longitude: longitudeValue,
        mapsUrl: `https://www.openstreetmap.org/${place.osm_type}/${place.osm_id}`,
        type: place.type || 'place_of_worship',
        rating: null,
        ratingCount: 0,
        source: 'OpenStreetMap',
        distanceKm: Number(distanceKm.toFixed(1)),
      };
    }).filter(Boolean).sort((first, second) => circleDistanceKm(latitude, longitude, first.latitude, first.longitude) - circleDistanceKm(latitude, longitude, second.latitude, second.longitude));

    return res.json({ places, source: 'OpenStreetMap', radiusKm });
  } catch (error) {
    console.error('Nearby place discovery failed:', error);
    return res.status(502).json({ message: 'Nearby place discovery is temporarily unavailable.' });
  }
});

app.get('/circles', authMiddleware, async (req, res) => {
  try {
    const circles = await getAllCircles();
    return res.json({ circles: circles.map(circle => formatCircle(circle, req.user._id)) });
  } catch (error) {
    console.error('Circle listing failed:', error);
    return res.status(500).json({ message: 'Unable to load circles right now.' });
  }
});

app.get('/circles/top', authMiddleware, async (req, res) => {
  try {
    await ensureDefaultCircles();
    const circles = await Circle.find().sort({ memberIds: -1, createdAt: -1 }).limit(12).lean();
    return res.json({ circles: circles.map(circle => formatCircle(circle, req.user._id)) });
  } catch (error) {
    console.error('Top circles failed:', error);
    return res.status(500).json({ message: 'Unable to load top circles right now.' });
  }
});

app.get('/circles/mine', authMiddleware, async (req, res) => {
  try {
    const circles = await Circle.find({ memberIds: req.user._id }).sort({ updatedAt: -1 }).lean();
    return res.json({ circles: circles.map(circle => formatCircle(circle, req.user._id)) });
  } catch (error) {
    console.error('My circles failed:', error);
    return res.status(500).json({ message: 'Unable to load your circles right now.' });
  }
});

app.get('/circles/nearby', authMiddleware, async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radiusKm = Math.min(500, Math.max(1, Number(req.query.radiusKm) || 50));
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: 'A valid latitude and longitude are required.' });
    }

    const circles = await getAllCircles();
    const nearby = circles
      .map(circle => {
        const [circleLongitude, circleLatitude] = circle.location?.coordinates || [];
        if (!Number.isFinite(circleLatitude) || !Number.isFinite(circleLongitude)) return null;
        const distanceKm = circleDistanceKm(latitude, longitude, circleLatitude, circleLongitude);
        return distanceKm <= radiusKm ? { ...formatCircle(circle, req.user._id), distanceKm: Math.round(distanceKm * 10) / 10 } : null;
      })
      .filter(Boolean)
      .sort((first, second) => first.distanceKm - second.distanceKm);

    return res.json({ circles: nearby });
  } catch (error) {
    console.error('Nearby circles failed:', error);
    return res.status(500).json({ message: 'Unable to find nearby circles right now.' });
  }
});

app.get('/circles/matches', authMiddleware, async (req, res) => {
  try {
    const level = typeof req.query.level === 'string' ? req.query.level : '';
    const pagesPerDay = Number(req.query.pagesPerDay);
    const minutesPerDay = Number(req.query.minutesPerDay);
    const circles = await getAllCircles();
    const ranked = circles.map(circle => {
      const levelScore = level && circle.level !== 'All levels' && circle.level !== level ? 3 : 0;
      const pageScore = Number.isFinite(pagesPerDay) ? Math.abs(circle.pagesPerDay - pagesPerDay) : 0;
      const timeScore = Number.isFinite(minutesPerDay) ? Math.abs(circle.minutesPerDay - minutesPerDay) / 30 : 0;
      return { circle, matchScore: levelScore + pageScore + timeScore };
    }).sort((first, second) => first.matchScore - second.matchScore).slice(0, 12);

    return res.json({ circles: ranked.map(({ circle, matchScore }) => ({ ...formatCircle(circle, req.user._id), matchScore: Math.round(matchScore * 100) / 100 })) });
  } catch (error) {
    console.error('Circle matching failed:', error);
    return res.status(500).json({ message: 'Unable to find matching circles right now.' });
  }
});

app.post('/circles', authMiddleware, async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 60) : '';
    const description = typeof req.body?.description === 'string' ? req.body.description.trim().slice(0, 240) : '';
    const level = typeof req.body?.level === 'string' ? req.body.level.trim().slice(0, 30) : 'All levels';
    const pagesPerDay = Number(req.body?.pagesPerDay);
    const minutesPerDay = Number(req.body?.minutesPerDay);
    const maxMembers = Number(req.body?.maxMembers);
    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);
    const locationLabel = typeof req.body?.locationLabel === 'string' ? req.body.locationLabel.trim().slice(0, 80) : 'Online circle';

    if (!name) return res.status(400).json({ message: 'Circle name is required.' });
    if (!Number.isFinite(pagesPerDay) || pagesPerDay <= 0 || !Number.isFinite(minutesPerDay) || minutesPerDay < 5) {
      return res.status(400).json({ message: 'Choose a valid daily target.' });
    }
    const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
    const circle = await Circle.create({
      name, description, creatorName: req.user.fullName, level,
      pagesPerDay: Math.min(20, pagesPerDay), minutesPerDay: Math.min(240, Math.round(minutesPerDay)),
      maxMembers: Number.isFinite(maxMembers) ? Math.min(500, Math.max(2, Math.round(maxMembers))) : 50,
      memberIds: [req.user._id],
      location: { type: 'Point', coordinates: hasCoordinates ? [longitude, latitude] : undefined, label: locationLabel },
    });
    req.user.circlesJoined = (req.user.circlesJoined ?? 0) + 1;
    await req.user.save();
    return res.status(201).json({ circle: formatCircle(circle, req.user._id) });
  } catch (error) {
    console.error('Circle creation failed:', error);
    return res.status(500).json({ message: 'Unable to create this circle right now.' });
  }
});

app.post('/circles/:id/join', authMiddleware, async (req, res) => {
  try {
    const circle = await Circle.findById(req.params.id);
    if (!circle) return res.status(404).json({ message: 'Circle not found.' });
    const userId = String(req.user._id);
    const isMember = circle.memberIds.some(member => String(member) === userId);
    if (!isMember && circle.memberIds.length >= circle.maxMembers) return res.status(409).json({ message: 'This circle is full.' });
    if (!isMember) {
      circle.memberIds.push(req.user._id);
      await circle.save();
      req.user.circlesJoined = (req.user.circlesJoined ?? 0) + 1;
      await req.user.save();
    }
    return res.json({ circle: formatCircle(circle, req.user._id) });
  } catch (error) {
    console.error('Circle join failed:', error);
    return res.status(500).json({ message: 'Unable to join this circle right now.' });
  }
});

const GEMINI_SYSTEM_PROMPT =
  'You are a helpful assistant for the Halakat app. ' +
  'Answer user questions clearly and concisely. ' +
  'When answering religious questions, prefer well-known, mainstream opinions and avoid giving personal fatwas. ' +
  'If you are not sure about an Islamic ruling, say you are not certain and advise the user to consult a qualified scholar.';

async function callGemini(contents, generationConfig = {}) {
  if (!GEMINI_API_KEY) {
    const error = new Error('Gemini is not configured on the server.');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
        contents,
        generationConfig,
      }),
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Gemini request failed.');
    error.statusCode = response.status;
    throw error;
  }

  return data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim() || '';
}

app.get('/ai/status', (_req, res) => {
  return res.json({ configured: Boolean(GEMINI_API_KEY), model: GEMINI_MODEL, provider: 'Gemini' });
});

app.post('/ai/chat', async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    const contents = messages
      .filter(message => message && typeof message.content === 'string')
      .map(message => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content.slice(0, 8000) }],
      }));

    if (!contents.length) {
      return res.status(400).json({ message: 'At least one message is required.' });
    }

    const text = await callGemini(contents, { temperature: 0.4, maxOutputTokens: 512 });
    return res.json({ text });
  } catch (error) {
    console.error('Gemini chat failed:', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Gemini chat failed.' });
  }
});

app.post('/ai/transcribe', async (req, res) => {
  try {
    const audioBase64 = typeof req.body?.audioBase64 === 'string' ? req.body.audioBase64 : '';
    const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType : 'audio/mp4';

    if (!audioBase64) {
      return res.status(400).json({ message: 'Audio data is required.' });
    }

    const text = await callGemini([
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          { text: 'Transcribe this Quran recitation in Arabic only. Return only the Arabic words that were recited, with no commentary.' },
        ],
      },
    ], { temperature: 0, maxOutputTokens: 1024 });

    return res.json({ text });
  } catch (error) {
    console.error('Gemini transcription failed:', error);
    return res.status(error.statusCode || 500).json({ message: error.message || 'Gemini transcription failed.' });
  }
});

function validateRuntimeConfig() {
  if (isVercel && (!process.env.MONGODB_URI || MONGODB_URI === localMongoUri || MONGODB_URI.includes('localhost') || MONGODB_URI.includes('127.0.0.1'))) {
    throw new Error('Missing Vercel MONGODB_URI. Set a hosted MongoDB Atlas connection string in the Vercel project environment variables.');
  }

  if ((isVercel || process.env.NODE_ENV === 'production') && (!process.env.JWT_SECRET || JWT_SECRET === 'halakat-dev-secret')) {
    throw new Error('Missing Vercel JWT_SECRET. Set a secure JWT secret in the Vercel project environment variables.');
  }
}

async function connectToDatabase() {
  validateRuntimeConfig();

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return;
  }

  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
}

module.exports = {
  app,
  connectToDatabase,
};
