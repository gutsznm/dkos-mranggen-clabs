const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Kost = require('../models/Kost');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const bookingValidation = [
  body('kostId')
    .isMongoId()
    .withMessage('ID kost tidak valid'),
  body('startDate')
    .isISO8601()
    .withMessage('Format tanggal mulai tidak valid'),
  body('duration')
    .isInt({ min: 1, max: 12 })
    .withMessage('Durasi sewa harus 1-12 bulan'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Catatan maksimal 500 karakter')
];

router.post('/', authenticateToken, bookingValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }

    const { kostId, startDate, duration, notes } = req.body;

    // Check if kost exists and has available rooms
    const kost = await Kost.findById(kostId);
    if (!kost) {
      return res.status(400).json({
        message: 'Kost tidak ditemukan'
      });
    }

    if (kost.availableRooms <= 0) {
      return res.status(400).json({
        message: 'Kost sudah penuh'
      });
    }

    // Calculate end date and total amount
    const start = new Date(startDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + duration);
    
    const totalAmount = kost.price * duration;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      kost: kostId,
      startDate: start,
      endDate: end,
      duration,
      totalAmount,
      notes
    });

    await booking.save();

    // Update available rooms
    kost.availableRooms -= 1;
    if (kost.availableRooms === 0) {
      kost.status = 'full';
    }
    await kost.save();

    res.status(201).json({
      message: 'Booking berhasil dibuat',
      data: booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat membuat booking'
    });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, paymentStatus } = req.query;
    
    let query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    const bookings = await Booking.find(query)
      .populate('kost', 'name address roomType price')
      .populate('approvedBy', 'name')
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

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('kost', 'name address roomType price facilities rules images')
      .populate('user', 'name email phone')
      .populate('approvedBy', 'name');
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking tidak ditemukan'
      });
    }
    
    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }
    
    res.json({
      message: 'Data booking berhasil diambil',
      data: booking
    });
    
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data booking'
    });
  }
});

router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking tidak ditemukan'
      });
    }
    
    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }
    
    // Check if booking can be cancelled
    if (booking.status !== 'pending') {
      return res.status(400).json({
        message: 'Booking tidak dapat dibatalkan'
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
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
      message: 'Booking berhasil dibatalkan',
      data: booking
    });
    
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat membatalkan booking'
    });
  }
});

router.post('/payments/:bookingId/proof', authenticateToken, uploadSingle, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking tidak ditemukan'
      });
    }
    
    // Check if user owns this booking
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        message: 'File bukti pembayaran harus diupload'
      });
    }
    
    // Update booking with payment proof
    booking.paymentProof = `/uploads/${req.file.filename}`;
    booking.paymentStatus = 'paid';
    await booking.save();
    
    res.json({
      message: 'Bukti pembayaran berhasil diupload',
      data: booking
    });
    
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat upload bukti pembayaran'
    });
  }
});

router.get('/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'active' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        { $match: { status: { $in: ['active', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);
    
    res.json({
      message: 'Statistik booking berhasil diambil',
      data: {
        totalBookings,
        pendingBookings,
        activeBookings,
        completedBookings,
        cancelledBookings,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('Get booking statistics error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil statistik booking'
    });
  }
});

module.exports = router; 