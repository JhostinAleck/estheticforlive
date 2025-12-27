import { useState, useEffect } from 'react';
import { sanityClient, urlFor } from '../lib/sanity';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  faIcon: string;
  image?: string;
}

export interface BeforeAfterResult {
  _id: string;
  title: string;
  description?: string;
  beforeImage: string;
  afterImage: string;
  categoryId?: string;
}

export interface HeroSlide {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface SiteSettings {
  servicesSection: {
    title: string;
    subtitle: string;
  };
  resultsSection: {
    title: string;
    subtitle: string;
  };
}

// Default data for fallback
const defaultCategories: Category[] = [
  { _id: '1', name: 'Faciales', slug: 'faciales', faIcon: 'fa-solid fa-spa', description: 'Tratamientos para el rostro' },
  { _id: '2', name: 'Corporales', slug: 'corporales', faIcon: 'fa-solid fa-person-dress', description: 'Tratamientos reductores y anticelulíticos' },
  { _id: '3', name: 'Neuromoduladores', slug: 'neuromoduladores', faIcon: 'fa-solid fa-star', description: 'Bótox y rellenos' },
  { _id: '4', name: 'Masajes', slug: 'masajes', faIcon: 'fa-solid fa-hand-sparkles', description: 'Relajación y drenaje' },
];

const defaultResults: BeforeAfterResult[] = [
  {
    _id: '1',
    title: 'Limpieza Facial',
    description: 'Resultados después de 3 sesiones',
    beforeImage: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400',
    afterImage: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',
  },
  {
    _id: '2',
    title: 'Tratamiento Corporal',
    description: 'Reducción de medidas',
    beforeImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    afterImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
  },
];

const defaultHeroSlides: HeroSlide[] = [
  {
    _id: '1',
    title: 'Realza tu Belleza Natural',
    subtitle: 'Centro de Estética',
    description: 'Tratamientos personalizados con la mejor tecnología',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920',
    ctaText: 'Agendar Cita',
  },
  {
    _id: '2',
    title: 'Expertos en Armonización',
    subtitle: 'Resultados Naturales',
    description: 'Más de 500 clientes satisfechos',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1920',
    ctaText: 'Ver Servicios',
  },
];

const defaultSettings: SiteSettings = {
  servicesSection: {
    title: 'Nuestros Servicios',
    subtitle: 'Explora nuestra gama completa de tratamientos diseñados para resaltar tu belleza natural.',
  },
  resultsSection: {
    title: 'Resultados Reales',
    subtitle: 'Transformaciones que hablan por sí solas',
  },
};

export function useHomePage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [results, setResults] = useState<BeforeAfterResult[]>(defaultResults);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const categoriesQuery = `*[_type == "category"] | order(order asc) {
          _id,
          name,
          "slug": slug.current,
          description,
          faIcon,
          image
        }`;

        // Fetch before/after results
        const resultsQuery = `*[_type == "beforeAfter"] | order(order asc) {
          _id,
          title,
          description,
          beforeImage,
          afterImage,
          "categoryId": category->_id
        }`;

        // Fetch hero slides
        const heroQuery = `*[_type == "heroSlide" && isActive == true] | order(order asc) {
          _id,
          title,
          subtitle,
          description,
          image,
          ctaText,
          ctaLink
        }`;

        // Fetch site settings
        const settingsQuery = `*[_type == "siteSettings"][0] {
          servicesSection,
          resultsSection
        }`;

        const [categoriesData, resultsData, heroData, settingsData] = await Promise.all([
          sanityClient.fetch(categoriesQuery),
          sanityClient.fetch(resultsQuery),
          sanityClient.fetch(heroQuery),
          sanityClient.fetch(settingsQuery),
        ]);

        if (categoriesData?.length > 0) {
          setCategories(categoriesData.map((cat: any) => ({
            ...cat,
            image: cat.image ? urlFor(cat.image).width(400).height(300).url() : undefined,
          })));
        }

        if (resultsData?.length > 0) {
          setResults(resultsData.map((result: any) => ({
            ...result,
            beforeImage: result.beforeImage ? urlFor(result.beforeImage).width(400).height(500).url() : '',
            afterImage: result.afterImage ? urlFor(result.afterImage).width(400).height(500).url() : '',
          })));
        }

        if (heroData?.length > 0) {
          setHeroSlides(heroData.map((slide: any) => ({
            ...slide,
            image: slide.image ? urlFor(slide.image).width(1920).height(1080).url() : '',
          })));
        }

        if (settingsData) {
          setSettings({
            servicesSection: settingsData.servicesSection || defaultSettings.servicesSection,
            resultsSection: settingsData.resultsSection || defaultSettings.resultsSection,
          });
        }
      } catch (err) {
        console.warn('Using default home page data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { categories, results, heroSlides, settings, loading };
}
