const express = require('express');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get analytics for the logged-in organizer (Module 4)
router.get('/stats', protect, authorize('organizer', 'admin'), async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { organizer: req.user._id };
    const events = await Event.find(filter);
    const eventIds = events.map((e) => e._id);

    const bookings = await Booking.find({ event: { $in: eventIds }, status: 'confirmed' }).populate(
      'event',
      'title price'
    );

    const totalEvents = events.length;
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalSeatsBooked = bookings.reduce((sum, b) => sum + b.seats, 0);

    // Bookings per event (for chart)
    const bookingsPerEvent = events.map((event) => {
      const eventBookings = bookings.filter((b) => b.event && b.event._id.toString() === event._id.toString());
      return {
        eventTitle: event.title,
        seatsBooked: event.bookedSeats,
        totalSeats: event.totalSeats,
        revenue: eventBookings.reduce((sum, b) => sum + b.totalAmount, 0)
      };
    });

    res.json({
      success: true,
      stats: {
        totalEvents,
        totalBookings,
        totalRevenue,
        totalSeatsBooked,
        bookingsPerEvent
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
