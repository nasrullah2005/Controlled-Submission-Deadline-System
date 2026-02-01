const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars from the file we renamed to .env
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Route files - THESE PATHS MUST BE CORRECT
const authRoutes = require('./routes/authRoutes');
const deadlineRoutes = require('./routes/deadlineRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/submissions', submissionRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});