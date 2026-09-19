const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    category: {
      type: String,
      enum: ['Music', 'Tech', 'Sports', 'Workshop', 'Conference', 'Comedy', 'Other'],
      default: 'Other'
    },
    banner: {
      type: String,
      default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
    },
    venue: {
      type: String,
      required: [true, 'Venue is required']
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    time: {
      type: String,
      required: [true, 'Event time is required']
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1
    },
    bookedSeats: {
      type: Number,
      default: 0
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming'
    }
  },
  { timestamps: true }
);

// Virtual for available seats
eventSchema.virtual('availableSeats').get(function () {
  return this.totalSeats - this.bookedSeats;
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
