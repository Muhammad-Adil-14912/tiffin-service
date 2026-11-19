const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be configured before starting the Tiffin Service API.');
}

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

connectDB();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header (for example, server-to-server health
    // checks and command-line clients) are not browser CORS requests.
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/tiffins', require('./routes/tiffins'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Tiffin Service API' });
});

app.use((err, req, res, next) => {
  if (err.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin is not allowed' });
  }
  console.error(err.stack);
  return res.status(500).json({ success: false, message: 'Server Error' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
