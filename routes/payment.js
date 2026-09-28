const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Upload payment proof (user only)
router.post('/:bookingId/proof', authenticateToken, uploadSingle, async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: 'Bukti pembayaran harus diupload'
      });
    }
    
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({
        message: 'Booking tidak ditemukan'
      });
    }
    
    // Check if user is owner
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Anda tidak memiliki akses ke booking ini'
      });
    }
    
    // Check if booking status allows payment proof upload
    if (booking.status !== 'approved') {
      return res.status(400).json({
        message: 'Booking harus disetujui terlebih dahulu'
      });
    }
    
    // Update booking
    booking.paymentProof = req.file.filename;
    booking.paymentStatus = 'paid';
    await booking.save();
    
    res.json({
      message: 'Bukti pembayaran berhasil diupload',
      data: {
        paymentProof: req.file.filename,
        paymentStatus: 'paid'
      }
    });
    
  } catch (error) {
    console.error('Upload payment proof error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat upload bukti pembayaran'
    });
  }
});

// Verify payment (admin only) - POST method untuk kompatibilitas dengan frontend
router.post('/:bookingId/verify', authenticateToken, requireAdmin, [
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
    
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        message: 'Pembayaran belum dilakukan'
      });
    }
    
    // Update booking
    booking.paymentStatus = 'verified';
    booking.status = 'active';
    booking.adminNotes = req.body.adminNotes || booking.adminNotes;
    await booking.save();
    
    res.json({
      message: 'Pembayaran berhasil diverifikasi',
      data: booking
    });
    
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat verifikasi pembayaran'
    });
  }
});

// Verify payment (admin only) - PUT method untuk konsistensi
router.put('/:bookingId/verify', authenticateToken, requireAdmin, [
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
    
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        message: 'Pembayaran belum dilakukan'
      });
    }
    
    // Update booking
    booking.paymentStatus = 'verified';
    booking.status = 'active';
    booking.adminNotes = req.body.adminNotes || booking.adminNotes;
    await booking.save();
    
    res.json({
      message: 'Pembayaran berhasil diverifikasi',
      data: booking
    });
    
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat verifikasi pembayaran'
    });
  }
});

// Reject payment (admin only)
router.put('/:bookingId/reject', authenticateToken, requireAdmin, [
  body('adminNotes')
    .notEmpty()
    .withMessage('Catatan admin harus diisi')
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
    
    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({
        message: 'Pembayaran belum dilakukan'
      });
    }
    
    // Update booking
    booking.paymentStatus = 'unpaid';
    booking.paymentProof = null;
    booking.adminNotes = req.body.adminNotes;
    await booking.save();
    
    res.json({
      message: 'Pembayaran berhasil ditolak',
      data: booking
    });
    
  } catch (error) {
    console.error('Reject payment error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menolak pembayaran'
    });
  }
});

// Get payment statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const unpaidPayments = await Booking.countDocuments({ paymentStatus: 'unpaid' });
    const paidPayments = await Booking.countDocuments({ paymentStatus: 'paid' });
    const verifiedPayments = await Booking.countDocuments({ paymentStatus: 'verified' });
    
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'verified' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const pendingRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const pendingAmount = pendingRevenue.length > 0 ? pendingRevenue[0].total : 0;
    
    res.json({
      message: 'Statistik pembayaran berhasil diambil',
      data: {
        unpaidPayments,
        paidPayments,
        verifiedPayments,
        totalRevenue: revenue,
        pendingRevenue: pendingAmount
      }
    });
    
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil statistik pembayaran'
    });
  }
});

// Get payments by status (admin only)
router.get('/by-status/:status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.params;
    
    if (!['unpaid', 'paid', 'verified'].includes(status)) {
      return res.status(400).json({
        message: 'Status pembayaran tidak valid'
      });
    }
    
    const bookings = await Booking.find({ paymentStatus: status })
      .populate('user', 'name email phone')
      .populate('kost', 'name roomType price')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      message: `Data pembayaran dengan status ${status} berhasil diambil`,
      data: bookings
    });
    
  } catch (error) {
    console.error('Get payments by status error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data pembayaran'
    });
  }
});

// Handle upload errors
router.use(handleUploadError);

module.exports = router; 