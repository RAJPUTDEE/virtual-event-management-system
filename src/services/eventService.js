const { nextId, state } = require('../store');
const { findUserById, sanitizeUser } = require('./authService');
const { sendRegistrationEmail } = require('./emailService');

function findEventById(id) {
  return state.events.find((event) => event.id === id) || null;
}

function assertOrganizer(user) {
  if (!user || user.role !== 'organizer') {
    const error = new Error('organizer access required');
    error.statusCode = 403;
    throw error;
  }
}

function assertEventOwnership(event, user) {
  if (event.organizerId !== user.id) {
    const error = new Error('you can only manage your own events');
    error.statusCode = 403;
    throw error;
  }
}

function normalizeEventInput(payload) {
  const { title, date, time, description } = payload;

  if (!title || !date || !time || !description) {
    const error = new Error('title, date, time, and description are required');
    error.statusCode = 400;
    throw error;
  }

  return {
    title: String(title).trim(),
    date: String(date).trim(),
    time: String(time).trim(),
    description: String(description).trim()
  };
}

function createEvent(payload, user) {
  assertOrganizer(user);

  const eventData = normalizeEventInput(payload);
  const event = {
    id: nextId(),
    ...eventData,
    organizerId: user.id,
    organizerName: user.name,
    participants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  state.events.push(event);
  return event;
}

function listEvents() {
  return state.events;
}

function getEvent(id) {
  const event = findEventById(id);
  if (!event) {
    const error = new Error('event not found');
    error.statusCode = 404;
    throw error;
  }

  return event;
}

function updateEvent(id, payload, user) {
  assertOrganizer(user);

  const event = getEvent(id);
  assertEventOwnership(event, user);

  const updates = normalizeEventInput(payload);

  Object.assign(event, updates, {
    updatedAt: new Date().toISOString()
  });

  return event;
}

function deleteEvent(id, user) {
  assertOrganizer(user);

  const eventIndex = state.events.findIndex((entry) => entry.id === id);
  if (eventIndex === -1) {
    const error = new Error('event not found');
    error.statusCode = 404;
    throw error;
  }

  const event = state.events[eventIndex];
  assertEventOwnership(event, user);

  state.events.splice(eventIndex, 1);

  for (const attendee of state.users) {
    attendee.registrations = attendee.registrations.filter((registrationId) => registrationId !== id);
  }

  return event;
}

async function registerForEvent(id, user) {
  const event = getEvent(id);
  const attendee = findUserById(user.id);

  if (!attendee) {
    const error = new Error('user not found');
    error.statusCode = 404;
    throw error;
  }

  if (event.participants.includes(attendee.id)) {
    const error = new Error('user is already registered for this event');
    error.statusCode = 409;
    throw error;
  }

  event.participants.push(attendee.id);
  attendee.registrations.push(event.id);

  await sendRegistrationEmail(sanitizeUser(attendee), event);

  return {
    event,
    attendee: sanitizeUser(attendee)
  };
}

module.exports = {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  registerForEvent,
  updateEvent
};