import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  // Check for token in cookies first, then in Authorization header
  const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];

  if (!token) {
    // If it's an API request, return JSON error
    if (isApiRequest(req)) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    // For web requests, redirect to login
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // If it's an API request, return JSON error
    if (isApiRequest(req)) {
      return res.status(401).json({ message: 'Invalid token, authorization denied' });
    }
    // For web requests, redirect to login
    return res.redirect('/login');
  }
};

// Helper function to determine if request is an API request
function isApiRequest(req) {
  // Check if it's an API route
  if (req.path.startsWith('/api/')) {
    return true;
  }
  
  // Check content type for JSON requests
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    return true;
  }
  
  // Check content type for multipart/form-data (file uploads)
  if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
    return true;
  }
  
  // Check if Authorization header is present (indicates API call)
  if (req.header('Authorization')) {
    return true;
  }
  
  return false;
}

export default authMiddleware;
