const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load backend/.env before importing other modules
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
  quiet: true,
});

console.log(
  'Gemini API Key Loaded:',
  Boolean(process.env.GEMINI_API_KEY)
);

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Samjhao backend is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Allow long Gemini requests (frontend timeout is 5 minutes)
    server.requestTimeout = 360000;
    server.headersTimeout = 370000;
    server.timeout = 360000;

    server.on('error', (err) => {
      console.error('Server listen error:', err.message);
    });
  } catch (error) {
    console.error('Server failed to start:', error.message);
    process.exit(1);
  }
}

startServer();
