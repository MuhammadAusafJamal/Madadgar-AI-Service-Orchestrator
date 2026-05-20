import express from 'express';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

const BRAND = '#e4b722';

// Escape user-supplied values before dropping them into the HTML template.
const esc = (value = '') =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const firstName = (name) => esc(String(name || '').trim().split(/\s+/)[0] || 'there');

const formatWhen = (booking) =>
  [booking.preferredDate, booking.preferredTime].filter(Boolean).join(' · ') ||
  'To be confirmed';

const formatPrice = (booking) =>
  typeof booking.price === 'number'
    ? `PKR ${booking.price.toLocaleString()}`
    : null;

// A compact details table shared by every booking email.
const detailsTable = (booking) => {
  const rows = [
    ['Service', booking.serviceTitle],
    ['Provider', booking.providerName],
    ['When', formatWhen(booking)],
    ['Location', booking.location],
    ['Price', formatPrice(booking)],
    ['Details', booking.reason],
  ].filter(([, value]) => value);

  return `<table style="width:100%;border-collapse:collapse;margin:20px 0;">
    ${rows
      .map(
        ([label, value]) => `<tr>
          <td style="padding:8px 0;color:#6b7280;font-size:13px;width:96px;vertical-align:top;">${esc(label)}</td>
          <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${esc(value)}</td>
        </tr>`,
      )
      .join('')}
  </table>`;
};

// Wrap content in the branded shell.
const shell = (heading, accent, bodyHtml) => `<!doctype html>
<html>
  <body style="margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:24px;">
      <div style="text-align:center;padding:8px 0 16px;">
        <span style="font-size:20px;font-weight:800;color:${BRAND};">Madadgar</span>
      </div>
      <div style="background:#ffffff;border-radius:14px;overflow:hidden;">
        <div style="background:${accent};height:6px;"></div>
        <div style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:19px;color:#111827;">${heading}</h1>
          ${bodyHtml}
        </div>
      </div>
      <p style="text-align:center;color:#9ca3af;font-size:12px;margin-top:16px;">
        This is an automated message from the Madadgar app.
      </p>
    </div>
  </body>
</html>`;

// Build the list of emails to send for a given booking event. Each entry has
// { to, toName, subject, html }; entries with no recipient are dropped.
const buildEmails = (event, booking) => {
  const details = detailsTable(booking);
  const emails = [];

  if (event === 'created') {
    emails.push({
      to: booking.takerEmail,
      toName: booking.takerName,
      subject: `Booking request sent — ${booking.serviceTitle || 'Madadgar'}`,
      html: shell(
        'Booking request sent ✅',
        '#16a34a',
        `<p style="color:#374151;font-size:14px;">Hi ${firstName(booking.takerName)},</p>
         <p style="color:#374151;font-size:14px;">We've sent your request to <b>${esc(booking.providerName)}</b>. You'll get another email the moment they respond.</p>
         ${details}`,
      ),
    });
    emails.push({
      to: booking.providerEmail,
      toName: booking.providerName,
      subject: `New booking request — ${booking.serviceTitle || 'Madadgar'}`,
      html: shell(
        'You have a new booking request 📩',
        BRAND,
        `<p style="color:#374151;font-size:14px;">Hi ${firstName(booking.providerName)},</p>
         <p style="color:#374151;font-size:14px;"><b>${esc(booking.takerName || 'A customer')}</b> wants to book your service. Open the Madadgar app to accept or decline.</p>
         ${details}`,
      ),
    });
  } else if (event === 'accepted') {
    emails.push({
      to: booking.takerEmail,
      toName: booking.takerName,
      subject: `Booking accepted — ${booking.serviceTitle || 'Madadgar'}`,
      html: shell(
        'Your booking was accepted 🎉',
        '#16a34a',
        `<p style="color:#374151;font-size:14px;">Hi ${firstName(booking.takerName)},</p>
         <p style="color:#374151;font-size:14px;">Good news — <b>${esc(booking.providerName)}</b> accepted your booking. They'll be in touch via chat.</p>
         ${details}`,
      ),
    });
  } else if (event === 'declined') {
    emails.push({
      to: booking.takerEmail,
      toName: booking.takerName,
      subject: `Booking declined — ${booking.serviceTitle || 'Madadgar'}`,
      html: shell(
        'Your booking was declined',
        '#dc2626',
        `<p style="color:#374151;font-size:14px;">Hi ${firstName(booking.takerName)},</p>
         <p style="color:#374151;font-size:14px;">Unfortunately <b>${esc(booking.providerName)}</b> couldn't take this booking. You can find another provider in the Madadgar app.</p>
         ${details}`,
      ),
    });
  } else if (event === 'completed') {
    emails.push({
      to: booking.takerEmail,
      toName: booking.takerName,
      subject: `Service completed — ${booking.serviceTitle || 'Madadgar'}`,
      html: shell(
        'Your service is complete ✅',
        '#16a34a',
        `<p style="color:#374151;font-size:14px;">Hi ${firstName(booking.takerName)},</p>
         <p style="color:#374151;font-size:14px;"><b>${esc(booking.providerName)}</b> has marked your booking as completed. We hope it went well — please take a moment to rate your experience in the Madadgar app.</p>
         ${details}`,
      ),
    });
  }

  return emails.filter((email) => email.to);
};

// POST /api/email/booking  { event, booking }
// event: 'created' | 'accepted' | 'declined' | 'completed'
router.post('/booking', async (req, res) => {
  const { event, booking } = req.body || {};

  if (!event || !booking) {
    return res
      .status(400)
      .json({ success: false, message: 'event and booking are required' });
  }
  if (!['created', 'accepted', 'declined', 'completed'].includes(event)) {
    return res
      .status(400)
      .json({ success: false, message: `Unknown event "${event}"` });
  }

  const emails = buildEmails(event, booking);
  const results = await Promise.all(emails.map((email) => sendEmail(email)));

  return res.json({
    success: true,
    sent: results.filter((r) => r.ok).length,
    skipped: results.filter((r) => r.skipped).length,
    failed: results.filter((r) => !r.ok && !r.skipped).length,
  });
});

export default router;
