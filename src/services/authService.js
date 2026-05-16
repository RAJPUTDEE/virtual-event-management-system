const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { nextId, state } = require('../store');

const ROLE_VALUES = new Set(['organizer', 'attendee']);
const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
}

async function registerUser({ name, email, password, role }) {
  if (!name || !email || !password) {
    const error = new Error('name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedRole = role ? String(role).trim().toLowerCase() : 'attendee';

  if (!ROLE_VALUES.has(normalizedRole)) {
    const error = new Error('role must be organizer or attendee');
    error.statusCode = 400;
    throw error;
  }

  const existingUser = state.users.find((user) => user.email === normalizedEmail);
  if (existingUser) {
    const error = new Error('email is already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = {
    id: nextId(),
    name: String(name).trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: normalizedRole,
    registrations: [],
    createdAt: new Date().toISOString()
  };

  state.users.push(user);

  return sanitizeUser(user);
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error('email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = state.users.find((entry) => entry.email === normalizedEmail);

  if (!user) {
    const error = new Error('invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    const error = new Error('invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'development-secret',
    { expiresIn: '8h' }
  );

  return {
    token,
    user: sanitizeUser(user)
  };
}

function findUserById(id) {
  return state.users.find((user) => user.id === id) || null;
}

module.exports = {
  loginUser,
  findUserById,
  registerUser,
  sanitizeUser
};