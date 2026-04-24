require('dotenv').config();

const { app, connectToDatabase } = require('./app');
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Halakat API listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Halakat API:', error);
    process.exit(1);
  }
}

startServer();
