import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Transactional email transport over SMTP, built for Brevo's free SMTP relay
// (300 emails/day, no credit card). Credentials come from the backend .env:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
//   EMAIL_SENDER_NAME, EMAIL_SENDER_ADDRESS

let transporter = null;

export const isEmailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );

// Lazily create (and cache) the Nodemailer transport so a missing config never
// crashes the server at startup.
const getTransporter = () => {
  if (transporter) return transporter;
  if (!isEmailConfigured()) return null;

  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587/2525 = STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
};

// Send one email. Best-effort: never throws — a failed or unconfigured send is
// logged and reported back so a booking is never blocked by email problems.
export const sendEmail = async ({ to, toName, subject, html }) => {
  if (!to) return { ok: false, skipped: true, reason: 'no-recipient' };

  const tx = getTransporter();
  if (!tx) {
    logger.log('Email', 'SMTP not configured — skipping send', { to, subject });
    return { ok: false, skipped: true, reason: 'not-configured' };
  }

  const senderEmail = process.env.EMAIL_SENDER_ADDRESS;
  if (!senderEmail) {
    logger.log('Email', 'EMAIL_SENDER_ADDRESS not set — skipping send', { to });
    return { ok: false, skipped: true, reason: 'no-sender' };
  }

  try {
    const info = await tx.sendMail({
      from: {
        name: process.env.EMAIL_SENDER_NAME || 'Madadgar',
        address: senderEmail,
      },
      to: { name: toName || '', address: to },
      subject,
      html,
    });
    logger.log('Email', 'Sent', { to, subject, messageId: info.messageId });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    logger.log('Email', 'Send failed', { to, subject, detail: err.message });
    return { ok: false, error: err.message };
  }
};
