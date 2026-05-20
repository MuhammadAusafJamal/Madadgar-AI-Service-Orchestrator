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

      // Short-circuit for smalltalk / off-topic / unclear messages — no booking pipeline needed.
      if (intent.intentType && intent.intentType !== 'service_request') {
        const message = await IntentAgent.generateDynamicMessage('smalltalk', userLang, {
          userInput,
        });
        logger.log('Orchestrator Agent', 'Smalltalk / unclear input, replying conversationally', {
          intentType: intent.intentType,
        });
        return {
          success: true,
          message,
          intent,
          logs: logger.getLogs(),
        };
      }

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
          intent,
          logs: logger.getLogs(),
        };
      }

      // Intent is complete — run the full agentic pipeline so the trace shows a
      // real multi-agent flow (planning → decision → action → follow-up). The
      // booking here is SIMULATED for the trace; the app's actual booking still
      // happens on the client against the Firestore catalog.
      logger.log('Orchestrator Agent', 'Intent complete — running provider pipeline', intent);

      let recommendation = null;
      try {
        // Tool use: geocode the user's location.
        const coords = await LocationAgent.geocodeLocation(intent.location);
        // Discover candidate providers for the requested service.
        const providers = await ProviderAgent.discoverProviders(intent.service, coords);
        // Reason: score and rank the candidates.
        const ranked = RankingAgent.rankProviders(providers, coords);
        // Decision: pick the best provider.
        recommendation = DecisionAgent.selectBestProvider(ranked);
        if (recommendation) {
          // Action: simulate the booking, then schedule follow-up + notify.
          const booking = await BookingAgent.createBooking(recommendation, intent);
          await FollowupAgent.scheduleFollowup(booking);
          await NotificationAgent.sendNotification(booking);
        }
      } catch (pipelineError) {
        // The pipeline only feeds the trace — its failure must not break the
        // chat reply.
        logger.log('Orchestrator Agent', 'Pipeline step failed (non-fatal)', {
          error: pipelineError.message,
        });
      }

      // The frontend still matches the real Firestore catalog and lets the user
      // pick a provider to book; this message invites them to do so.
      const message = await IntentAgent.generateDynamicMessage('suggestions', userLang, {
        service: intent.service,
        location: intent.location,
        time: intent.time,
      });

      logger.log('Orchestrator Agent', 'Workflow complete — returning suggestions context', intent);

      return {
        success: true,
        intent,
        message,
        recommendation,
        logs: logger.getLogs(),
      };
    } catch (error) {
      logger.log('Orchestrator Agent', 'Workflow failed', { error: error.message });
      return {
        success: false,
        message: error.message,
        logs: logger.getLogs(),
      };
    }
  }
}