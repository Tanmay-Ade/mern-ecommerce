const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/User");

const ADMIN_EMAILS = ['tanmayade6698@gmail.com'];

const registerUser = async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: `Registration successful as ${role}`,
      user: {
        userName,
        email,
        role
      }
    });
  } catch (error) {
    console.log("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error in registration"
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exist! Please register first",
      });
    }

    const token = generateToken(checkUser);

    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const googleCallback = async (req, res) => {
  try {
    let user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      const role = ADMIN_EMAILS.includes(req.user.email) ? 'admin' : 'user';
      user = new User({
        userName: req.user.userName,
        email: req.user.email,
        role,
        googleId: req.user.googleId
      });
      await user.save();
    }

    const token = generateToken(user);

    res.cookie("token", token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }).json({
      success: true,
      message: "Google authentication successful",
      user: {
        email: user.email,
        role: user.role,
        id: user._id,
        userName: user.userName,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
      userName: user.userName,
    },
    process.env.SESSION_SECRET,
    { expiresIn: "24h" }
  );
};

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await User.findOneAndUpdate(
      { email },
      {
        resetPasswordToken,
        resetPasswordExpire: Date.now() + 3600000 // 1 hour validity
      }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
    
    return res.status(200).json({
      success: true,
      message: "Password reset link sent successfully",
      resetUrl
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in password reset process"
    });
  }
};

const refreshToken = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.SESSION_SECRET, { ignoreExpiration: true });
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const newToken = generateToken(user);

    res.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        userName: user.userName
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error in password reset"
    });
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.SESSION_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired', 
          needsRefresh: true 
        });
      }
      throw error;
    }
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized user!' 
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
  googleCallback,
  refreshToken
};

// This is server/controllers/auth/auth-controller.js
