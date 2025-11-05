import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import userMiddleware from './middlewares/userMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import linkRoutes from './routes/linkRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontend2/views'));

// Middleware
//for vercel deployment
// app.use(cors({
//     origin: 'https://linkit-97du.vercel.app',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors());

// Serve static files from frontend2/public
app.use(express.static(path.join(__dirname, '../frontend2/public')));

// Explicit favicon route
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend2/public/images/newLogo.png'));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// User middleware to check authentication and pass user data to templates
app.use(userMiddleware);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Main routes for EJS views
app.get('/', (req, res) => {
  res.render('landing', { 
    isDarkMode: false,
    user: req.user || null
  });
});

// Routes
app.use('/', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);

// 404 handler - must be after all other routes
app.use('*', (req, res) => {
  res.status(404).render('404', {
    isDarkMode: false,
    user: req.user || null
  });
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
