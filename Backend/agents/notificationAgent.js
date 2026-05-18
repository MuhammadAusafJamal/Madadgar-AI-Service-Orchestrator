import axios from 'axios';
import { logger } from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

export class NotificationAgent {
  static async sendNotification(booking) {
    logger.log('Notification Agent', 'Preparing to send notifications');
    
    // Webhook URL for n8n
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (webhookUrl) {
      try {
        await axios.post(webhookUrl, {
          event: 'booking_confirmed',
          bookingId: booking.bookingId,
          provider: booking.providerName,
          service: booking.service,
          time: booking.time,
          location: booking.location
        });
        logger.log('Notification Agent', 'Triggered n8n webhook successfully');
      } catch (error) {
        logger.log('Notification Agent', 'Failed to trigger n8n webhook', { error: error.message });
      }
    } else {
      logger.log('Notification Agent', 'No n8n webhook configured, simulating email notification');
    }

    return { notified: true, method: webhookUrl ? 'n8n' : 'simulated' };
  }
}
