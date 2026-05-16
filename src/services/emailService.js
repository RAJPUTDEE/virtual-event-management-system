const nodemailer = require('nodemailer');
const { state } = require('../store');

const transport = nodemailer.createTransport({ jsonTransport: true });

async function sendRegistrationEmail(user, event) {
  const message = {
    from: 'no-reply@virtual-events.local',
    to: user.email,
    subject: `Registration confirmed: ${event.title}`,
    text: `Hi ${user.name}, your registration for ${event.title} on ${event.date} at ${event.time} is confirmed.`
  };

  const info = await transport.sendMail(message);

  state.emailOutbox.push({
    ...message,
    messageId: info.messageId,
    sentAt: new Date().toISOString()
  });

  return info;
}

function getEmailOutbox() {
  return state.emailOutbox;
}

module.exports = {
  getEmailOutbox,
  sendRegistrationEmail
};