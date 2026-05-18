import { logger } from '../utils/logger.js';
import { calculateDistance } from '../utils/distance.js';

export class RankingAgent {
  static rankProviders(providers, userCoordinates) {
    logger.log('Ranking Agent', 'Calculating scores for providers');
    
    const rankedProviders = providers.map(provider => {
      const distance = calculateDistance(
        userCoordinates.lat, userCoordinates.lon,
        provider.lat, provider.lon
      );
      
      // FinalScore = 0.4(Rating) + 0.3(Availability) + 0.2(1/Distance) + 0.1(ResponseSpeed)
      // Normalize distance (avoid division by zero)
      const distanceScore = 1 / (distance + 0.1); 
      
      const score = (0.4 * provider.rating) + 
                    (0.3 * provider.availability * 5) + // Normalize availability to 0-5 scale roughly
                    (0.2 * distanceScore) + 
                    (0.1 * provider.responseSpeed * 5); // Normalize speed

      return {
        ...provider,
        distance: distance.toFixed(2),
        score: score.toFixed(2)
      };
    });

    // Sort descending by score
    rankedProviders.sort((a, b) => b.score - a.score);
    
    logger.log('Ranking Agent', 'Ranking complete', rankedProviders.map(p => ({name: p.name, score: p.score, distance: p.distance})));
    return rankedProviders;
  }
}
