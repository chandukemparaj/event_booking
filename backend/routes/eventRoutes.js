const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events (with optional search/filter/category)
router.get('/', async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    let eventsQuery = Event.find(query).populate('organizer', 'name email');

    if (sort === 'price-low') eventsQuery = eventsQuery.sort({ price: 1 });
    else if (sort === 'price-high') eventsQuery = eventsQuery.sort({ price: -1 });
    else eventsQuery = eventsQuery.sort({ date: 1 });

    const events = await eventsQuery;
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/events
// @desc    Create new event (organizer/admin only)
router.post(
  '/',
  protect,
  authorize('organizer', 'admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const event = await Event.create({ ...req.body, organizer: req.user._id });
      res.status(201).json({ success: true, event });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/events/:id
// @desc    Update an event (organizer who owns it, or admin)
router.put('/:id', protect, authorize('organizer', 'admin'), async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
router.delete('/:id', protect, authorize('organizer', 'admin'), async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/events/organizer/mine
// @desc    Get events created by logged-in organizer
router.get('/organizer/mine', protect, authorize('organizer', 'admin'), async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: events.length, events });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
