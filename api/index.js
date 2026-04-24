const { app, connectToDatabase } = require('../server/app');

module.exports = async function handler(req, res) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('Vercel request failed:', error);
    return res.status(500).json({ message: 'Backend is unavailable right now.' });
  }
};
