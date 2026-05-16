const { randomUUID } = require('crypto');

const state = {
  users: [],
  events: [],
  emailOutbox: []
};

function resetStore() {
  state.users.length = 0;
  state.events.length = 0;
  state.emailOutbox.length = 0;
}

function nextId() {
  return randomUUID();
}

module.exports = {
  state,
  resetStore,
  nextId
};