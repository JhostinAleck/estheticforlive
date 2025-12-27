import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useHomePage } from '../../hooks/useHomePage';

const ServicesGrid = () => {
  const { categories, settings, loading } = useHomePage();

  if (loading) {
    return (
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-surface relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Tratamientos</span>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary mt-2 mb-4">
            {settings.servicesSection.title}
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            {settings.servicesSection.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/servicios#${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-white border border-border hover:border-accent/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] overflow-hidden bg-accent-light">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className={`${category.faIcon} text-6xl text-accent/30`} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 w-full p-6">
                <div className="bg-accent-light w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:text-white transition-colors text-accent">
                  <i className={`${category.faIcon} text-xl`} />
                </div>

                <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-muted text-sm mb-4 line-clamp-2">
                  {category.description}
                </p>

                <div className="flex items-center text-sm font-medium text-accent group-hover:translate-x-1 transition-transform">
                  Ver más <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
