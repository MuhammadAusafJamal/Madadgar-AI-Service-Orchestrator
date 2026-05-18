import { logger } from '../utils/logger.js';
import { IntentAgent } from '../agents/intentAgent.js';
import { LocationAgent } from '../agents/locationAgent.js';
import { ProviderAgent } from '../agents/providerAgent.js';
import { RankingAgent } from '../agents/rankingAgent.js';
import { DecisionAgent } from '../agents/decisionAgent.js';
import { BookingAgent } from '../agents/bookingAgent.js';
import { NotificationAgent } from '../agents/notificationAgent.js';
import { FollowupAgent } from '../agents/followupAgent.js';

export class Orchestrator {
  static async processRequest(userInput, history = '') {
    logger.clearLogs();
    logger.log('Orchestrator Agent', 'Starting workflow execution for request', { userInput });

    try {
      // Step 1: Understand Intent
      const intent = await IntentAgent.extractIntent(userInput, history);
      const userLang = intent.language || 'english';
      
      const missingFields = [];
      if (!intent.service) missingFields.push('service type (e.g., AC Technician, Plumber)');
      if (!intent.location) missingFields.push('specific location including city (e.g., DHA Karachi, G-13 Islamabad)');
      if (!intent.time) missingFields.push('time (e.g., tomorrow morning, today at 5 PM)');

      if (missingFields.length > 0) {
        const message = await IntentAgent.generateDynamicMessage('missing_fields', userLang, { missingFields });
        logger.log('Orchestrator Agent', 'Missing required fields, asking user', { missingFields, message });
        return {
          success: true,
          message,
          logs: logger.getLogs()
        };
      }

      // Step 2: Location and Distance Geocoding
      const coordinates = await LocationAgent.geocodeLocation(intent.location);

      // Step 3: Discover Providers
      const providers = await ProviderAgent.discoverProviders(intent.service, coordinates);

      // Step 4: Rank Providers
      const rankedProviders = RankingAgent.rankProviders(providers, coordinates);

      // Step 5: Decision Selection
      const bestProvider = DecisionAgent.selectBestProvider(rankedProviders);

      if (!bestProvider) {
        throw new Error('No available providers found nearby.');
      }

      // Step 6: Booking
      const booking = await BookingAgent.createBooking(bestProvider, intent);

      // Step 7: Notification (n8n Webhook)
      await NotificationAgent.sendNotification(booking);

      // Step 8: Follow Up Scheduling
      await FollowupAgent.scheduleFollowup(booking);

      logger.log('Orchestrator Agent', 'Workflow execution completed successfully');

      const successMessage = await IntentAgent.generateDynamicMessage('success', userLang, {
        service: intent.service,
        providerName: bestProvider.name,
        location: intent.location,
        time: intent.time
      });

      return {
        success: true,
        booking,
        message: successMessage,
        logs: logger.getLogs()
      };

    } catch (error) {
      logger.log('Orchestrator Agent', 'Workflow failed', { error: error.message });
      return {
        success: false,
        message: error.message,
        logs: logger.getLogs()
      };
    }
  }
}
