import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Middleware to check if user is logged in and pass user data to templates
export const userMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        
        if (user) {
          req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            profileImage: user.profileImage,
            profileClicks: user.profileClicks
          };
        }
      } catch (error) {
        // Invalid token, clear it
        res.clearCookie('token');
      }
    }
    
    next();
  } catch (error) {
    console.error('Error in userMiddleware:', error);
    next();
  }
};

export default userMiddleware;

