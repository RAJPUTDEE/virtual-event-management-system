const express = require('express');
const { authenticateRequest } = require('../middleware/authMiddleware');
const {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  registerForEvent,
  updateEvent
} = require('../services/eventService');

const router = express.Router();

router.use(authenticateRequest);

router.get('/', (req, res) => {
  return res.json({ events: listEvents() });
});

router.get('/:id', (req, res, next) => {
  try {
    return res.json({ event: getEvent(req.params.id) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const event = createEvent(req.body, req.user);
    return res.status(201).json({ event });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const event = updateEvent(req.params.id, req.body, req.user);
    return res.json({ event });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const event = deleteEvent(req.params.id, req.user);
    return res.json({ event });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/register', async (req, res, next) => {
  try {
    const registration = await registerForEvent(req.params.id, req.user);
    return res.status(201).json(registration);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;