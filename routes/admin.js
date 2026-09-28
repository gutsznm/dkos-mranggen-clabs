const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Kost = require('../models/Kost');
const Booking = require('../models/Booking');
const Gallery = require('../models/Gallery');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

router.get('/users', async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    
    let query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Data users berhasil diambil',
      data: users
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data users'
    });
  }
});

router.get('/users/:userId', async (req, res) => {
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

router.put('/users/:userId', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus 2-100 karakter'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Format email tidak valid'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role harus user atau admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive harus boolean')
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
      req.params.userId,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }
    
    res.json({
      message: 'User berhasil diperbarui',
      data: updatedUser
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui user'
    });
  }
});

router.get('/kosts', async (req, res) => {
  try {
    const { roomType, status } = req.query;
    
    let query = {};
    
    if (roomType) {
      query.roomType = roomType;
    }
    
    if (status) {
      query.status = status;
    }
    
    const kosts = await Kost.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Data kosts berhasil diambil',
      data: kosts
    });
    
  } catch (error) {
    console.error('Get kosts error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data kosts'
    });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('kost', 'name roomType price')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Data bookings berhasil diambil',
      data: bookings
    });
    
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data bookings'
    });
  }
});

router.put('/bookings/:bookingId/approve', [
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Catatan admin maksimal 500 karakter')
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
    
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking tidak ditemukan'
      });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: 'Booking tidak dapat disetujui'
      });
    }
    
    // Update booking
    booking.status = 'approved';
    booking.adminNotes = req.body.adminNotes || booking.adminNotes;
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();
    await booking.save();
    
    res.json({
      message: 'Booking berhasil disetujui',
      data: booking
    });
    
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menyetujui booking'
    });
  }
});

router.put('/bookings/:bookingId/reject', [
  body('adminNotes')
    .notEmpty()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Catatan admin harus diisi dan maksimal 500 karakter')
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
    
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking tidak ditemukan'
      });
    }
    
    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: 'Booking tidak dapat ditolak'
      });
    }
    
    // Update booking
    booking.status = 'rejected';
    booking.adminNotes = req.body.adminNotes;
    booking.approvedBy = req.user._id;
    booking.approvedAt = new Date();
    await booking.save();
    
    // Update available rooms
    const kost = await Kost.findById(booking.kost);
    if (kost) {
      kost.availableRooms += 1;
      if (kost.status === 'full') {
        kost.status = 'available';
      }
      await kost.save();
    }
    
    res.json({
      message: 'Booking berhasil ditolak',
      data: booking
    });
    
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menolak booking'
    });
  }
});

router.get('/gallery', async (req, res) => {
  try {
    const { kostId, mediaType, isActive } = req.query;
    
    let query = {};
    
    if (kostId) {
      query.kostId = kostId;
    }
    
    if (mediaType) {
      query.mediaType = mediaType;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const gallery = await Gallery.find(query)
      .populate('kostId', 'name roomType')
      .populate('uploadedBy', 'name')
      .sort({ order: 1, createdAt: -1 });
    
    res.json(gallery); // Frontend mengharapkan array langsung
    
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data gallery'
    });
  }
});

router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalKosts,
      totalBookings,
      pendingBookings,
      totalRevenue,
      availableRooms
    ] = await Promise.all([
      User.countDocuments(),
      Kost.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.aggregate([
        { $match: { status: { $in: ['active', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Kost.aggregate([
        { $group: { _id: null, total: { $sum: '$availableRooms' } } }
      ])
    ]);
    
    res.json({
      message: 'Statistik dashboard berhasil diambil',
      data: {
        totalUsers,
        totalKosts,
        totalBookings,
        pendingBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        availableRooms: availableRooms[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil statistik dashboard'
    });
  }
});

module.exports = router; 