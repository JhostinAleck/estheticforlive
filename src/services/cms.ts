import { services } from '../data/services';
import { ServicesData } from '../types';

/**
 * CMS Service Layer
 * 
 * This service abstracts the data fetching logic.
 * Currently it returns static data from the local file system.
 * To connect to a real CMS (Strapi, Sanity, etc.), you would update the fetch functions below.
 */

// Simulated delay to mimic network request
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const cmsService = {
  /**
   * Fetch all services organized by category
   */
  async getServices(): Promise<ServicesData> {
    // In a real implementation:
    // const response = await fetch(`${API_URL}/services`);
    // return response.json();
    
    await delay(100); // Simulate network latency
    return services;
  },

  /**
   * Fetch a specific service by ID
   * Note: This assumes unique IDs across all categories
   */
  async getServiceById(id: string) {
    await delay(100);
    const allServices = Object.values(services).flat();
    return allServices.find(s => s.id === id);
  },

  /**
   * Fetch social media configuration
   * This could come from a "Global Settings" content type in the CMS
   */
  async getGlobalSettings() {
    await delay(50);
    return {
      siteName: 'Esthetic For Live',
      contact: {
        whatsapp: '+57300XXXXXXX',
        email: 'contacto@estheticforlive.com'
      }
    };
  }
};
