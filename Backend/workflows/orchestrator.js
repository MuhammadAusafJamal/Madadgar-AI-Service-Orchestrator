import { logger } from '../utils/logger.js';
import { IntentAgent } from '../agents/intentAgent.js';

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

      // Intent is complete — hand back to the frontend so it can match real services
      // from the Firestore catalog and let the user pick one to book.
      const message = await IntentAgent.generateDynamicMessage('suggestions', userLang, {
        service: intent.service,
        location: intent.location,
        time: intent.time,
      });

      logger.log('Orchestrator Agent', 'Intent complete, returning suggestions context', intent);

      return {
        success: true,
        intent,
        message,
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