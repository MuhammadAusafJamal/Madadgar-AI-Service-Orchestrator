import { logger } from '../utils/logger.js';

export class ProviderAgent {
  static async discoverProviders(serviceType, userCoordinates) {
    logger.log('Provider Agent', `Discovering providers for ${serviceType} near user coordinates`);
    
    // Simulate finding providers from a database (like Firestore)
    // In a real app, we'd query Firestore for providers matching the service category
    // and within a bounding box. For the hackathon, we simulate a mock dataset.
    
    const mockProviders = [
      { id: 'p1', name: 'Amir Hassan', service: serviceType, lat: userCoordinates.lat + 0.01, lon: userCoordinates.lon + 0.01, rating: 4.9, availability: 0.9, responseSpeed: 0.8, profilePic: 'https://i.pravatar.cc/150?img=11', trips: 130, experience: 10, about: 'Expert professional with over 10 years of experience providing top-notch home services.' },
      { id: 'p2', name: 'Kamran Khan', service: serviceType, lat: userCoordinates.lat + 0.03, lon: userCoordinates.lon - 0.02, rating: 4.2, availability: 1.0, responseSpeed: 0.6, profilePic: 'https://i.pravatar.cc/150?img=14', trips: 85, experience: 5, about: 'Reliable and fast service worker. Available 24/7 for emergency repairs.' },
      { id: 'p3', name: 'Usman Ahmed', service: serviceType, lat: userCoordinates.lat - 0.02, lon: userCoordinates.lon + 0.03, rating: 4.8, availability: 0.4, responseSpeed: 0.9, profilePic: 'https://i.pravatar.cc/150?img=53', trips: 200, experience: 8, about: 'Highly rated by the community. Ensuring high quality parts and long-lasting repairs.' },
      { id: 'p4', name: 'Zainab Tariq', service: serviceType, lat: userCoordinates.lat + 0.005, lon: userCoordinates.lon + 0.005, rating: 3.5, availability: 1.0, responseSpeed: 0.5, profilePic: 'https://i.pravatar.cc/150?img=32', trips: 20, experience: 2, about: 'New in the area but highly motivated to provide the best service.' },
    ];

    logger.log('Provider Agent', `Found ${mockProviders.length} potential providers`, mockProviders.map(p => p.name));
    return mockProviders;
  }
}
