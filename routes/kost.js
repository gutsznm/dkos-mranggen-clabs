const express = require('express');
const { body, validationResult } = require('express-validator');
const Kost = require('../models/Kost');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const kostValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Nama kost harus 2-200 karakter'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Alamat kost harus diisi'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Deskripsi kost harus diisi'),
  body('roomType')
    .isIn(['A', 'B'])
    .withMessage('Tipe kamar harus A atau B'),
  body('price')
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Harga harus angka positif'),
  body('totalRooms')
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage('Total kamar minimal 1'),
  body('availableRooms')
    .isNumeric()
    .isInt({ min: 0 })
    .withMessage('Kamar tersedia tidak boleh negatif'),
  body('facilities')
    .isArray()
    .withMessage('Fasilitas harus berupa array'),
  body('rules')
    .isArray()
    .withMessage('Peraturan harus berupa array')
];

router.get('/', async (req, res) => {
  try {
    const { roomType, status, minPrice, maxPrice } = req.query;
    
    let query = { isActive: true };
    
    if (roomType) {
      query.roomType = roomType;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    const kosts = await Kost.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      message: 'Data kost berhasil diambil',
      data: kosts
    });
    
  } catch (error) {
    console.error('Get kosts error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data kost'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const kost = await Kost.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!kost) {
      return res.status(404).json({
        message: 'Kost tidak ditemukan'
      });
    }
    
    res.json({
      message: 'Data kost berhasil diambil',
      data: kost
    });
    
  } catch (error) {
    console.error('Get kost error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data kost'
    });
  }
});

router.post('/', authenticateToken, requireAdmin, kostValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }
    
    const kostData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const kost = new Kost(kostData);
    await kost.save();
    
    res.status(201).json({
      message: 'Kost berhasil ditambahkan',
      data: kost
    });
    
  } catch (error) {
    console.error('Create kost error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menambahkan kost'
    });
  }
});

router.put('/:id', authenticateToken, requireAdmin, kostValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }
    
    const kost = await Kost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!kost) {
      return res.status(404).json({
        message: 'Kost tidak ditemukan'
      });
    }
    
    res.json({
      message: 'Kost berhasil diperbarui',
      data: kost
    });
    
  } catch (error) {
    console.error('Update kost error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui kost'
    });
  }
});

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const kost = await Kost.findByIdAndDelete(req.params.id);
    
    if (!kost) {
      return res.status(404).json({
        message: 'Kost tidak ditemukan'
      });
    }
    
    res.json({
      message: 'Kost berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete kost error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menghapus kost'
    });
  }
});

router.get('/type/:roomType', async (req, res) => {
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

module.exports = router; 