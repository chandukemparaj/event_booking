const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    seats: {
      type: Number,
      required: true,
      min: 1
    },
    totalAmount: {
      type: Number,
      required: true
    },
    bookingCode: {
      type: String,
      unique: true
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    }
  },
  { timestamps: true }
);

// Generate a unique booking code before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingCode) {
    this.bookingCode =
      'EVT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
