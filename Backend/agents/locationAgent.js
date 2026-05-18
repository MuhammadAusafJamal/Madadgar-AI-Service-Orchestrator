import axios from 'axios';
import { logger } from '../utils/logger.js';

export class LocationAgent {
  static async geocodeLocation(locationName, cityContext = 'Islamabad') {
    logger.log('Location Agent', `Geocoding location: ${locationName} in ${cityContext}`);
    try {
      // Use Nominatim OpenStreetMap API
      const query = `${locationName}, ${cityContext}, Pakistan`;
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'AIServiceOrchestrator/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        const coordinates = { lat: parseFloat(lat), lon: parseFloat(lon) };
        logger.log('Location Agent', 'Geocoding successful', coordinates);
        return coordinates;
      } else {
        logger.log('Location Agent', 'Location not found, using default coordinates');
        // Defaulting to a central coordinate for simulation if not found
        return { lat: 33.6844, lon: 73.0479 }; // Islamabad coordinates
      }
    } catch (error) {
      logger.log('Location Agent', 'Error geocoding location', { error: error.message });
      return { lat: 33.6844, lon: 73.0479 }; 
    }
  }
}
