import { logger } from '../utils/logger.js';

export class DecisionAgent {
  static selectBestProvider(rankedProviders) {
    logger.log('Decision Agent', 'Selecting the best provider from ranked list');
    
    if (!rankedProviders || rankedProviders.length === 0) {
      logger.log('Decision Agent', 'No providers available to select');
      return null;
    }

    // The best provider is the first one in the sorted list
    const bestProvider = rankedProviders[0];
    logger.log('Decision Agent', `Selected nearest/best available provider: ${bestProvider.name}`, bestProvider);
    
    return bestProvider;
  }
}
