const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Kost = require('../models/Kost');
const Booking = require('../models/Booking');
const { authenticateToken, requireOwnerOrAdmin } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      message: 'Data profil berhasil diambil',
      data: user
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data profil'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus 2-100 karakter'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Format nomor telepon tidak valid'),
  body('address.street')
    .optional()
    .trim(),
  body('address.city')
    .optional()
    .trim(),
  body('address.state')
    .optional()
    .trim(),
  body('address.zipCode')
    .optional()
    .trim()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      message: 'Profil berhasil diperbarui',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui profil'
    });
  }
});

// Change password
router.put('/profile/password', authenticateToken, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Password saat ini harus diisi'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password baru minimal 6 karakter')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Password saat ini salah'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      message: 'Password berhasil diubah'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengubah password'
    });
  }
});

// Get user's bookings
router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('kost', 'name roomType price images')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Data booking berhasil diambil',
      data: bookings
    });
    
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data booking'
    });
  }
});

// Get user's active booking
router.get('/bookings/active', authenticateToken, async (req, res) => {
  try {
    const activeBooking = await Booking.findOne({
      user: req.user._id,
      status: 'active'
    }).populate('kost', 'name roomType price images address');
    
    res.json({
      message: 'Data booking aktif berhasil diambil',
      data: activeBooking
    });
    
  } catch (error) {
    console.error('Get active booking error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data booking aktif'
    });
  }
});

// Get available kosts for user
router.get('/kost', authenticateToken, async (req, res) => {
  try {
    const kosts = await Kost.find({
      status: 'available',
      availableRooms: { $gt: 0 }
    }).populate('createdBy', 'name');
    
    res.json({
      message: 'Data kost tersedia berhasil diambil',
      data: kosts
    });
    
  } catch (error) {
    console.error('Get available kosts error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data kost'
    });
  }
});

// Get kost by room type for user
router.get('/kost/:roomType', authenticateToken, async (req, res) => {
  try {
    const { roomType } = req.params;
    
    if (!['A', 'B'].includes(roomType)) {
      return res.status(400).json({
        message: 'Tipe kamar harus A atau B'
      });
    }
    
    const kosts = await Kost.find({
      roomType,
      status: 'available',
      availableRooms: { $gt: 0 }
    }).populate('createdBy', 'name');
    
    res.json({
      message: `Data kost tipe ${roomType} berhasil diambil`,
      data: kosts
    });
    
  } catch (error) {
    console.error('Get kosts by type error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data kost'
    });
  }
});

// Get user by ID (admin or owner only)
router.get('/:userId', authenticateToken, requireOwnerOrAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }
    
    res.json({
      message: 'Data user berhasil diambil',
      data: user
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data user'
    });
  }
});

module.exports = router; 