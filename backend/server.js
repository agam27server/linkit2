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
import { updateUsername } from './controllers/userController.js';
import authMiddleware from './middlewares/authMiddleware.js';


dotenv.config();

const app = express();
const port = process.env.PORT;

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));

// Middleware
//for vercel deployment
// app.use(cors({
//     origin: 'https://linkit-97du.vercel.app',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors());

// Serve static files from frontend2/public
// app.use(express.static(path.join(__dirname, '../frontend2/public')));


// Static files with caching
app.use(
  express.static(path.join(__dirname, "frontend/public"), {
    maxAge: "1d", // Browser should cache for 1 day
    setHeaders: (res, filePath) => {
      // Cache only static assets, not HTML views
      if (
        filePath.endsWith(".js") ||
        filePath.endsWith(".css") ||
        filePath.endsWith(".png") ||
        filePath.endsWith(".jpg") ||
        filePath.endsWith(".jpeg") ||
        filePath.endsWith(".svg") ||
        filePath.endsWith(".ico")
      ) {
        res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day
      } else {
        // Prevent caching HTML files
        res.setHeader("Cache-Control", "no-store");
      }
    }
  })
);

// Explicit favicon route
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/public/images/newLogo.png'));
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

// Debug middleware to log all requests
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Request headers:', {
      'content-type': req.headers['content-type'],
      'authorization': req.headers['authorization'] ? 'Present' : 'Missing',
      'cookie': req.headers['cookie'] ? 'Present' : 'Missing'
    });
  }
  next();
});

// Routes
app.use('/', userRoutes);
// Mount userRoutes at /api/users for routes that need /api/users prefix
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);

// Register update-username route directly to ensure it's accessible
// This is a backup route in case the route in userRoutes.js doesn't work
app.put('/api/users/update-username', authMiddleware, updateUsername);
console.log('Directly registered route: PUT /api/users/update-username');

// 404 handler - must be after all other routes
app.use('*', (req, res) => {
  // Don't render 404 for API routes - return JSON instead
  if (req.path.startsWith('/api/')) {
    console.log(`404 - API route not found: ${req.method} ${req.path}`);
    return res.status(404).json({ message: 'API route not found' });
  }
  res.status(404).render('404', {
    isDarkMode: false,
    user: req.user || null
  });
});

// Start Server
// Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});

