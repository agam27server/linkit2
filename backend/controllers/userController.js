import User from "../models/user.js";
import Links from "../models/links.js";
import { generateToken, verifyToken } from "../helpers/jwtHelper.js";
import { generateProfileQRCode } from "../helpers/qrCodeHelper.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";
import NodeCache from "node-cache";

// cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// user registration
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.status(400).json({ message: "User with this email already exists." });
      }
      return res.render('register', { 
        title: 'Register - LinkIt',
        isDarkMode: false,
        error: "User with this email already exists." 
      });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.status(400).json({ message: "Username is already taken. Please choose another one." });
      }
      return res.render('register', { 
        title: 'Register - LinkIt',
        isDarkMode: false,
        error: "Username is already taken. Please choose another one." 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate profile URL and QR code
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    let qrCodeUrl = "";
    
    try {
      qrCodeUrl = await generateProfileQRCode(username, baseUrl);
    } catch (qrError) {
      console.error("Error generating QR code during registration:", qrError);
      // Continue without QR code if generation fails
    }

    const user = new User({
      username,
      email,
      password: hashedPassword,
      profileImage: req.file ? req.file.path : "",
      qrCodeUrl: qrCodeUrl,
    });

    await user.save();

    const token = generateToken(user._id);

    // Set token as httpOnly cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(201).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
        token,
      });
    }

    // Redirect to dashboard for form submissions
    res.redirect('/dashboard');
  } catch (error) {
    console.error("Error registering user:", error);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(500).json({ message: "Server error during registration." });
    }
    return res.render('register', { 
      title: 'Register - LinkIt',
      isDarkMode: false,
      error: "Server error during registration." 
    });
  }
};

// user login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      return res.render('login', { 
        title: 'Login - LinkIt',
        isDarkMode: false,
        error: "Invalid email or password" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      return res.render('login', { 
        title: 'Login - LinkIt',
        isDarkMode: false,
        error: "Invalid email or password" 
      });
    }

    const token = generateToken(user._id);

    // Set token as httpOnly cookie for security
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profileImage: user.profileImage,
        },
        token,
      });
    }

    // Redirect to dashboard for form submissions
    res.redirect('/dashboard');
  } catch (error) {
    console.error("Error logging in user:", error);
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(500).json({ message: "Server error during login" });
    }
    return res.render('login', { 
      title: 'Login - LinkIt',
      isDarkMode: false,
      error: "Server error during login" 
    });
  }
};

// fetch popular profiles
export const getPopularProfiles = async (req, res) => {
  try {
    const profiles = await User.find()
      .sort({ profileClicks: -1 })
      .limit(10);

    const response = profiles.map((profile) => ({
      id: profile._id,
      username: profile.username,
      profileImage: profile.profileImage,
      profileClicks: profile.profileClicks,
    }));

    res.json(response);
  } catch (error) {
    console.error("Error fetching popular profiles:", error);
    res.status(500).json({ message: "Server error while fetching profiles" });
  }
};

// create an in-memory cache
const profileViewCache = new NodeCache({ stdTTL: 24 * 60 * 60 });

// get public profile
export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const cacheKey = `profile_${user._id}_${userIp}`;

    if (!profileViewCache.has(cacheKey)) {
      user.profileClicks = (user.profileClicks || 0) + 1;
      await user.save();
      profileViewCache.set(cacheKey, true);
    }

    const links = await Links.find({ userId: user._id }).select("-__v");

    // Generate QR code if it doesn't exist
    let qrCodeUrl = user.qrCodeUrl;
    
    // Check if QR code exists and is valid
    const hasValidQRCode = qrCodeUrl && 
                          typeof qrCodeUrl === 'string' && 
                          qrCodeUrl.trim() !== '' && 
                          qrCodeUrl.startsWith('data:image');
    
    if (!hasValidQRCode) {
      try {
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const profileUrl = `${baseUrl}/profile/${user.username}`;
        console.log('API: Generating QR code for user:', user.username);
        console.log('API: Profile URL:', profileUrl);
        console.log('API: Base URL:', baseUrl);
        
        qrCodeUrl = await generateProfileQRCode(user.username, baseUrl);
        
        if (qrCodeUrl && typeof qrCodeUrl === 'string' && qrCodeUrl.trim() !== '' && qrCodeUrl.startsWith('data:image')) {
          console.log('API: QR code generated successfully, length:', qrCodeUrl.length);
          console.log('API: QR code preview:', qrCodeUrl.substring(0, 50) + '...');
          // Save the generated QR code to the database
          user.qrCodeUrl = qrCodeUrl;
          await user.save();
          console.log('API: QR code saved to database successfully');
        } else {
          console.error('API: QR code generation returned invalid result');
          console.error('API: QR code type:', typeof qrCodeUrl);
          console.error('API: QR code value:', qrCodeUrl ? qrCodeUrl.substring(0, 100) : 'null/undefined');
          qrCodeUrl = null;
        }
      } catch (qrError) {
        console.error("API: Error generating QR code:", qrError);
        console.error("API: Error message:", qrError.message);
        console.error("API: Error stack:", qrError.stack);
        qrCodeUrl = null;
      }
    } else {
      console.log('API: Using existing QR code from database, length:', qrCodeUrl.length);
    }

    const responseData = {
      username: user.username,
      profileImage: user.profileImage,
      profileClicks: user.profileClicks,
      links,
      qrCodeUrl: qrCodeUrl || null,
    };
    
    console.log('API: Sending response with qrCodeUrl:', qrCodeUrl ? 'Present (' + qrCodeUrl.length + ' chars)' : 'null');
    console.log('API: Response keys:', Object.keys(responseData));
    
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// update profile image
export const updateProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profileImage = req.file.path;
    await user.save();

    res.json({ profileImage: user.profileImage });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update username for the logged-in user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateUsername = async (req, res) => {
  try {
    console.log('Update username request received');
    console.log('Request body:', req.body);
    console.log('User ID from token:', req.user?.id);
    
    const { username: rawUsername } = req.body;
    
    // Trim and validate username
    if (!rawUsername || typeof rawUsername !== 'string') {
      console.log('Validation failed: Username is required or not a string');
      return res.status(400).json({ message: "Username is required" });
    }
    
    const username = rawUsername.trim();
    
    if (username.length === 0) {
      console.log('Validation failed: Username is empty after trim');
      return res.status(400).json({ message: "Username cannot be empty" });
    }

    // Check username length and format
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: "Username must be between 3 and 20 characters" });
    }

    // Check if username contains only alphanumeric characters and underscores
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
    }

    // Get current user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username is the same
    if (user.username === username) {
      return res.status(400).json({ message: "New username is the same as current username" });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken. Please choose another one." });
    }

    // Update username
    user.username = username;
    await user.save();

    res.json({ 
      message: "Username updated successfully",
      username: user.username 
    });
  } catch (error) {
    console.error("Error updating username:", error);
    
    // Handle duplicate key error (MongoDB unique constraint violation)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username is already taken. Please choose another one." });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message || "Validation error" });
    }
    
    // Generic server error
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// get logged-in user profile
export const getLoggedInUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const links = await Links.find({ userId: user._id });

    res.json({
      username: user.username,
      profileImage: user.profileImage,
      email: user.email,
      profileClicks: user.profileClicks,
      links,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error while fetching user profile" });
  }
};

// Render login page
export const renderLogin = async (req, res) => {
  try {
    res.render('login', { 
      title: 'Login - LinkIt',
      isDarkMode: false,
      error: null 
    });
  } catch (error) {
    console.error("Error rendering login page:", error);
    res.status(500).send("Server error");
  }
};

// Render register page
export const renderRegister = async (req, res) => {
  try {
    res.render('register', { 
      title: 'Register - LinkIt',
      isDarkMode: false,
      error: null 
    });
  } catch (error) {
    console.error("Error rendering register page:", error);
    res.status(500).send("Server error");
  }
};

// Render dashboard page
export const renderDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const links = await Links.find({ userId: user._id });

    res.render('dashboard', { 
      title: 'Dashboard - LinkIt',
      isDarkMode: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        profileClicks: user.profileClicks
      },
      links: links
    });
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    res.status(500).send("Server error");
  }
};

// Render public profile page
export const renderPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).render('publicProfile', { 
        title: `Profile - ${username}`,
        isDarkMode: false,
        username: username,
        profileData: null,
        isOwnProfile: false,
        error: "User not found"
      });
    }

    // Check if the logged-in user is viewing their own profile
    let isOwnProfile = false;
    try {
      const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];
      if (token) {
        const decoded = verifyToken(token);
        const currentUser = await User.findById(decoded.id);
        if (currentUser && currentUser.username === username) {
          isOwnProfile = true;
        }
      }
    } catch (authError) {
      // If token is invalid or missing, user is not authenticated
      // This is fine, just means isOwnProfile will be false
    }

    // Update profile clicks (with caching) - only if not viewing own profile
    if (!isOwnProfile) {
      const userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const cacheKey = `profile_${user._id}_${userIp}`;
      
      if (!profileViewCache.has(cacheKey)) {
        user.profileClicks = (user.profileClicks || 0) + 1;
        await user.save();
        profileViewCache.set(cacheKey, true);
      }
    }

    const links = await Links.find({ userId: user._id }).select("-__v");

    // Generate QR code if it doesn't exist
    let qrCodeUrl = user.qrCodeUrl;
    if (!qrCodeUrl || (typeof qrCodeUrl === 'string' && qrCodeUrl.trim() === '')) {
      try {
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        console.log('Render: Generating QR code for user:', user.username, 'with base URL:', baseUrl);
        qrCodeUrl = await generateProfileQRCode(user.username, baseUrl);
        if (qrCodeUrl && qrCodeUrl.trim() !== '') {
          console.log('Render: QR code generated successfully, length:', qrCodeUrl.length);
          // Save the generated QR code to the database
          user.qrCodeUrl = qrCodeUrl;
          await user.save();
          console.log('Render: QR code saved to database');
        } else {
          console.error('Render: QR code generation returned empty string');
          qrCodeUrl = null;
        }
      } catch (qrError) {
        console.error("Render: Error generating QR code:", qrError);
        console.error("Render: Error stack:", qrError.stack);
        qrCodeUrl = null;
      }
    } else {
      console.log('Render: Using existing QR code from database, length:', qrCodeUrl.length);
    }

    res.render('publicProfile', { 
      title: `Profile - ${username}`,
      isDarkMode: false,
      username: username,
      profileData: {
        username: user.username,
        profileImage: user.profileImage,
        profileClicks: user.profileClicks,
        links: links,
        qrCodeUrl: qrCodeUrl || null
      },
      isOwnProfile: isOwnProfile
    });
  } catch (error) {
    console.error("Error rendering public profile:", error);
    res.status(500).send("Server error");
  }
};

// Render rankings page
export const renderRankings = async (req, res) => {
  try {
    const profiles = await User.find()
      .sort({ profileClicks: -1 })
      .limit(10);

    const formattedProfiles = profiles.map((profile) => ({
      id: profile._id,
      username: profile.username,
      profileImage: profile.profileImage,
      profileClicks: profile.profileClicks,
    }));

    res.render('rankings', { 
      title: 'Rankings - LinkIt',
      isDarkMode: false,
      profiles: formattedProfiles
    });
  } catch (error) {
    console.error("Error rendering rankings:", error);
    res.status(500).send("Server error");
  }
};

// Logout user
export const logoutUser = (req, res) => {
  try {
    // Clear the token cookie with the same options used when setting it
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0 // Set to 0 to immediately expire the cookie
    });
    
    // Handle both API and web requests
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(200).json({ message: 'Logged out successfully' });
    }
    
    // Redirect to home page for web requests
    res.redirect('/');
  } catch (error) {
    console.error("Error during logout:", error);
    
    // Handle errors for both API and web requests
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      return res.status(500).json({ message: 'Error during logout' });
    }
    
    res.redirect('/');
  }
};