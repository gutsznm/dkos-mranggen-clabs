const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Judul harus diisi'],
    trim: true,
    maxlength: [200, 'Judul tidak boleh lebih dari 200 karakter']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Deskripsi tidak boleh lebih dari 500 karakter']
  },
  mediaUrl: {
    type: String,
    required: [true, 'URL media harus diisi'],
    trim: true
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  kostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kost',
    required: [true, 'ID kost harus diisi']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
gallerySchema.index({ kostId: 1, isActive: 1 });
gallerySchema.index({ mediaType: 1 });
gallerySchema.index({ order: 1 });

// Virtual for full media URL
gallerySchema.virtual('fullMediaUrl').get(function() {
  if (this.mediaUrl.startsWith('http')) {
    return this.mediaUrl;
  }
  return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${this.mediaUrl}`;
});

module.exports = mongoose.model('Gallery', gallerySchema); 