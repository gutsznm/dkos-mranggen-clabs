const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  kost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kost',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Tanggal mulai sewa harus diisi']
  },
  endDate: {
    type: Date,
    required: [true, 'Tanggal selesai sewa harus diisi']
  },
  duration: {
    type: Number, // in months
    required: [true, 'Durasi sewa harus diisi'],
    min: [1, 'Durasi minimal 1 bulan']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total biaya harus diisi'],
    min: [0, 'Total biaya tidak boleh negatif']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'verified'],
    default: 'unpaid'
  },
  paymentProof: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Catatan tidak boleh lebih dari 500 karakter']
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Catatan admin tidak boleh lebih dari 500 karakter']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
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
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ kost: 1, status: 1 });
bookingSchema.index({ status: 1, paymentStatus: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if booking is active
bookingSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Method to calculate total amount
bookingSchema.methods.calculateTotalAmount = function(pricePerMonth) {
  this.totalAmount = pricePerMonth * this.duration;
  return this.totalAmount;
};

// Pre-save middleware to validate dates
bookingSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('Tanggal mulai harus sebelum tanggal selesai'));
  }
  
  if (this.startDate < new Date()) {
    return next(new Error('Tanggal mulai tidak boleh di masa lalu'));
  }
  
  next();
});

module.exports = mongoose.model('Booking', bookingSchema); 