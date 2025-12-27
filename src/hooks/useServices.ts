import { useState, useEffect } from 'react';
import { sanityClient, urlFor } from '../lib/sanity';
import { services as localServices } from '../data/services';
import type { Service } from '../types';

interface SanityService {
  _id: string;
  name: string;
  description: string;
  category: string;
  faIcon: string;
  image?: {
    asset: {
      _ref: string;
    };
  };
  order?: number;
}

interface ServicesData {
  faciales: Service[];
  plasmaBioestimulantes: Service[];
  neuromoduladores: Service[];
  masajes: Service[];
  corporales: Service[];
  especiales: Service[];
}

const categoryMap: Record<string, keyof ServicesData> = {
  'FACIALES': 'faciales',
  'TRATAMIENTOS CON PLASMA Y BIOESTIMULANTES': 'plasmaBioestimulantes',
  'NEUROMODULADORES Y RELLENOS': 'neuromoduladores',
  'MASAJES Y RELAJACION': 'masajes',
  'CORPORALES REDUCTORES Y ANTICELULITICOS': 'corporales',
  'TRATAMIENTOS ESPECIALES': 'especiales',
};

export function useServices() {
  const [services, setServices] = useState<ServicesData>(localServices);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const query = `*[_type == "service"] | order(order asc) {
          _id,
          name,
          description,
          category,
          faIcon,
          image,
          order
        }`;

        const sanityServices: SanityService[] = await sanityClient.fetch(query);

        if (sanityServices && sanityServices.length > 0) {
          const grouped: ServicesData = {
            faciales: [],
            plasmaBioestimulantes: [],
            neuromoduladores: [],
            masajes: [],
            corporales: [],
            especiales: [],
          };

          sanityServices.forEach((service) => {
            const categoryKey = categoryMap[service.category];
            if (categoryKey) {
              const imageUrl = service.image ? urlFor(service.image).width(600).height(450).url() : '';
              console.log(`[Sanity] ${service.name}: ${imageUrl || 'SIN IMAGEN'}`);
              grouped[categoryKey].push({
                id: service._id,
                name: service.name,
                description: service.description,
                category: service.category,
                faIcon: service.faIcon || 'fa-solid fa-spa',
                image: imageUrl,
              });
            }
          });

          // Only use Sanity data if we have services
          const hasServices = Object.values(grouped).some(arr => arr.length > 0);
          if (hasServices) {
            setServices(grouped);
          }
        }
      } catch (err) {
        console.warn('Using local services data:', err);
        setError('Using local data');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  return { services, loading, error };
}
