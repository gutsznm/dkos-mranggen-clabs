const express = require('express');
const { body, validationResult } = require('express-validator');
const Gallery = require('../models/Gallery');
const Kost = require('../models/Kost');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadSingle, uploadMultiple, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Validation rules
const galleryValidation = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Judul harus 2-200 karakter'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Deskripsi maksimal 500 karakter'),
  body('kostId')
    .isMongoId()
    .withMessage('ID kost tidak valid'),
  body('mediaType')
    .optional()
    .isIn(['image', 'video'])
    .withMessage('Tipe media harus image atau video'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order harus angka positif')
];

// Get all gallery items (public)
router.get('/', async (req, res) => {
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
    
    res.json({
      message: 'Data gallery berhasil diambil',
      data: gallery
    });
    
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data gallery'
    });
  }
});

// Get gallery by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate('kostId', 'name roomType')
      .populate('uploadedBy', 'name');
    
    if (!gallery) {
      return res.status(404).json({
        message: 'Gallery tidak ditemukan'
      });
    }
    
    res.json({
      message: 'Data gallery berhasil diambil',
      data: gallery
    });
    
  } catch (error) {
    console.error('Get gallery by ID error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data gallery'
    });
  }
});

// Upload single media (admin only)
router.post('/', authenticateToken, requireAdmin, galleryValidation, uploadSingle, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        message: 'File media harus diupload'
      });
    }
    
    // Check if kost exists
    const kost = await Kost.findById(req.body.kostId);
    if (!kost) {
      return res.status(404).json({
        message: 'Kost tidak ditemukan'
      });
    }
    
    // Create gallery item
    const galleryData = {
      title: req.body.title,
      description: req.body.description || '',
      mediaUrl: req.file.filename,
      mediaType: req.body.mediaType || 'image',
      kostId: req.body.kostId,
      uploadedBy: req.user._id,
      order: req.body.order || 0
    };
    
    const gallery = new Gallery(galleryData);
    await gallery.save();
    
    // Populate references
    await gallery.populate('kostId', 'name roomType');
    await gallery.populate('uploadedBy', 'name');
    
    res.status(201).json({
      message: 'Media berhasil diupload',
      data: gallery
    });
    
  } catch (error) {
    console.error('Upload media error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat upload media'
    });
  }
});

// Upload multiple media (admin only)
router.post('/multiple', authenticateToken, requireAdmin, uploadMultiple, async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'File media harus diupload'
      });
    }
    
    const { kostId, mediaType = 'image' } = req.body;
    
    // Check if kost exists
    const kost = await Kost.findById(kostId);
    if (!kost) {
      return res.status(404).json({
        message: 'Kost tidak ditemukan'
      });
    }
    
    // Create gallery items
    const galleryItems = [];
    
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      const galleryData = {
        title: `Foto ${kost.name} ${i + 1}`,
        description: `Foto ${kost.name} ${i + 1}`,
        mediaUrl: file.filename,
        mediaType: mediaType,
        kostId: kostId,
        uploadedBy: req.user._id,
        order: i
      };
      
      const gallery = new Gallery(galleryData);
      await gallery.save();
      
      // Populate references
      await gallery.populate('kostId', 'name roomType');
      await gallery.populate('uploadedBy', 'name');
      
      galleryItems.push(gallery);
    }
    
    res.status(201).json({
      message: `${galleryItems.length} media berhasil diupload`,
      data: galleryItems
    });
    
  } catch (error) {
    console.error('Upload multiple media error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat upload media'
    });
  }
});

// Update gallery item (admin only)
router.put('/:id', authenticateToken, requireAdmin, galleryValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Data tidak valid',
        errors: errors.array()
      });
    }
    
    const gallery = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('kostId', 'name roomType')
    .populate('uploadedBy', 'name');
    
    if (!gallery) {
      return res.status(404).json({
        message: 'Gallery tidak ditemukan'
      });
    }
    
    res.json({
      message: 'Gallery berhasil diperbarui',
      data: gallery
    });
    
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat memperbarui gallery'
    });
  }
});

// Delete gallery item (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const gallery = await Gallery.findByIdAndDelete(req.params.id);
    
    if (!gallery) {
      return res.status(404).json({
        message: 'Gallery tidak ditemukan'
      });
    }
    
    // TODO: Delete file from storage if needed
    
    res.json({
      message: 'Gallery berhasil dihapus'
    });
    
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat menghapus gallery'
    });
  }
});

// Get gallery by kost ID (public)
router.get('/kost/:kostId', async (req, res) => {
  try {
    const gallery = await Gallery.find({
      kostId: req.params.kostId,
      isActive: true
    })
    .populate('kostId', 'name roomType')
    .populate('uploadedBy', 'name')
    .sort({ order: 1, createdAt: -1 });
    
    res.json({
      message: 'Data gallery kost berhasil diambil',
      data: gallery
    });
    
  } catch (error) {
    console.error('Get gallery by kost error:', error);
    res.status(500).json({
      message: 'Terjadi kesalahan saat mengambil data gallery'
    });
  }
});

// Handle upload errors
router.use(handleUploadError);

module.exports = router; 