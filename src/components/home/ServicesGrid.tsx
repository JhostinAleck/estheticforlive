import { Link } from 'react-router-dom';
import { Sparkles, Activity, Syringe, Zap, ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 'facialCare',
    title: 'Cuidado Facial',
    description: 'Protocolos especializados para renovar y nutrir tu piel.',
    icon: Sparkles,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Close-up%20of%20a%20woman%20with%20glowing%20skin%20after%20facial%20treatment%2C%20minimalist%2C%20spa%20atmosphere&image_size=square',
    path: '/servicios#faciales'
  },
  {
    id: 'bodyContouring',
    title: 'Moldeo Corporal',
    description: 'Tecnología avanzada para reducir medidas y tonificar.',
    icon: Activity,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Silhouette%20of%20a%20fit%20woman%20body%2C%20artistic%20lighting%2C%20aesthetic%20medicine%20concept&image_size=square',
    path: '/servicios#corporales'
  },
  {
    id: 'medicalAesthetics',
    title: 'Alta Estética',
    description: 'Procedimientos médicos para armonización y rejuvenecimiento.',
    icon: Syringe,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Medical%20aesthetic%20procedure%20setup%2C%20clean%2C%20sterile%2C%20luxury%20clinic%20environment&image_size=square',
    path: '/servicios#neuro'
  },
  {
    id: 'laserTechnology',
    title: 'Tecnología Láser',
    description: 'Depilación efectiva y tratamientos láser de vanguardia.',
    icon: Zap,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Laser%20hair%20removal%20device%20detail%2C%20modern%20technology%2C%20purple%20and%20blue%20light&image_size=square',
    path: '/servicios#especiales'
  }
];

const ServicesGrid = () => {
  return (
    <section className="py-24 bg-surface relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Tratamientos</span>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary mt-2 mb-4">Nuestros Servicios</h2>
          <p className="text-muted max-w-2xl mx-auto">
            Explora nuestra gama completa de tratamientos diseñados para resaltar tu belleza natural con la mejor tecnología.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                to={category.path}
                className="group relative overflow-hidden rounded-2xl bg-white border border-border hover:border-accent/50 hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-6">
                  <div className="bg-accent-light w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors text-accent">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-accent transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-muted text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center text-sm font-medium text-accent group-hover:translate-x-1 transition-transform">
                    Ver más <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
