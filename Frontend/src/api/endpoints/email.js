import { apiClient } from '../client';

// Ask the backend to send the booking emails for a given event.
// event: 'created' | 'accepted' | 'declined'.
export function sendBookingEmail({ event, booking }) {
  return apiClient.post('/api/email/booking', { event, booking });
}
