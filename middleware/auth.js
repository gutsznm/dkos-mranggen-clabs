const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token tidak ditemukan. Silakan login terlebih dahulu.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'Token tidak valid. Silakan login ulang.' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Akun Anda telah dinonaktifkan.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token tidak valid. Silakan login ulang.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token telah kadaluarsa. Silakan login ulang.' 
      });
    }
    return res.status(500).json({ 
      message: 'Terjadi kesalahan pada server.' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Akses ditolak. Anda tidak memiliki izin admin.' 
    });
  }
  next();
};

// Middleware to check if user is the owner or admin
const requireOwnerOrAdmin = (req, res, next) => {
  const { userId } = req.params;
  
  if (req.user.role === 'admin' || req.user._id.toString() === userId) {
    return next();
  }
  
  return res.status(403).json({ 
    message: 'Akses ditolak. Anda tidak memiliki izin untuk mengakses data ini.' 
  });
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnerOrAdmin,
  generateToken
}; 