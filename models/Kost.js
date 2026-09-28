const mongoose = require('mongoose');

const kostSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama kost harus diisi'],
    trim: true,
    maxlength: [200, 'Nama kost tidak boleh lebih dari 200 karakter']
  },
  address: {
    type: String,
    required: [true, 'Alamat kost harus diisi'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Deskripsi kost harus diisi'],
    trim: true
  },
  roomType: {
    type: String,
    enum: ['A', 'B'],
    required: [true, 'Tipe kamar harus diisi']
  },
  price: {
    type: Number,
    required: [true, 'Harga harus diisi'],
    min: [0, 'Harga tidak boleh negatif']
  },
  totalRooms: {
    type: Number,
    required: [true, 'Total kamar harus diisi'],
    min: [1, 'Total kamar minimal 1']
  },
  availableRooms: {
    type: Number,
    required: [true, 'Jumlah kamar tersedia harus diisi'],
    min: [0, 'Kamar tersedia tidak boleh negatif']
  },
  facilities: [{
    type: String,
    trim: true
  }],
  rules: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['available', 'full', 'maintenance'],
    default: 'available'
  },
  location: {
    latitude: Number,
    longitude: Number
  },
  nearbyPlaces: [{
    name: String,
    distance: String,
    description: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
kostSchema.index({ roomType: 1, status: 1 });
kostSchema.index({ price: 1 });
kostSchema.index({ availableRooms: 1 });

// Virtual for checking if kost is available
kostSchema.virtual('isAvailable').get(function() {
  return this.availableRooms > 0 && this.status === 'available';
});

// Method to update available rooms
kostSchema.methods.updateAvailableRooms = function(change) {
  this.availableRooms = Math.max(0, this.availableRooms + change);
  if (this.availableRooms === 0) {
    this.status = 'full';
  } else if (this.status === 'full') {
    this.status = 'available';
  }
  return this.save();
};

module.exports = mongoose.model('Kost', kostSchema); 