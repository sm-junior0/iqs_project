// utils/mailer.js
const nodemailer = require('nodemailer');

// Configure your SMTP transport here
// For demo: use Gmail, for production use a real SMTP server and env vars
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'niyitanganihonor@gmail.com',
    pass: process.env.SMTP_PASS || 'vjglftkborfuvsds'
  }
});

async function sendMail({ to, subject, text, html }) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'IQS <niyitanganihonor@gmail.com>',
    to,
    subject,
    text,
    html
  });
  return info;
}

module.exports = { sendMail };
