const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/bookings
// @desc    Book tickets for an event
router.post(
  '/',
  protect,
  [
    body('eventId').notEmpty().withMessage('Event ID is required'),
    body('seats').isInt({ min: 1 }).withMessage('Seats must be at least 1')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { eventId, seats } = req.body;
      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({ success: false, message: 'Event not found' });
      }

      const availableSeats = event.totalSeats - event.bookedSeats;
      if (seats > availableSeats) {
        return res.status(400).json({
          success: false,
          message: `Only ${availableSeats} seat(s) available for this event`
        });
      }

      const totalAmount = seats * event.price;

      const booking = await Booking.create({
        user: req.user._id,
        event: eventId,
        seats,
        totalAmount
      });

      event.bookedSeats += seats;
      await event.save();

      const populatedBooking = await Booking.findById(booking._id)
        .populate('event', 'title date time venue banner price')
        .populate('user', 'name email');

      res.status(201).json({
        success: true,
        message: 'Booking confirmed!',
        booking: populatedBooking
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/bookings/my
// @desc    Get logged-in user's booking history
router.get('/my', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title date time venue banner price category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookings/:id
// @desc    Get a single booking (for confirmation page)
router.get('/:id', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title date time venue banner price')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking and release seats
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const event = await Event.findById(booking.event);
    if (event) {
      event.bookedSeats = Math.max(0, event.bookedSeats - booking.seats);
      await event.save();
    }

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/bookings/event/:eventId
// @desc    Get all bookings for an event (organizer report - Module 4/5)
router.get('/event/:eventId', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ event: req.params.eventId, status: 'confirmed' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
