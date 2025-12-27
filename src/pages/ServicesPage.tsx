import Layout from '../components/layout/Layout';
import ServiceCard from '../components/services/ServiceCard';
import { useServices } from '../hooks/useServices';

const ServicesPage = () => {
  const { services, loading } = useServices();

  return (
    <Layout>
      <div className="bg-surface min-h-screen pt-24 pb-12 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Tratamientos</span>
            <h1 className="text-4xl md:text-6xl font-bold text-secondary mt-2 mb-6">Nuestros Servicios</h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Descubre nuestra amplia gama de tratamientos especializados.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Faciales */}
              {services.faciales.length > 0 && (
                <section id="faciales" className="mb-20">
                  <div className="flex items-center gap-4 mb-8">
                    <i className="fa-solid fa-spa text-accent text-2xl" />
                    <h2 className="text-3xl font-bold text-secondary">FACIALES</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.faciales.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              )}

              {/* Plasma y Bioestimulantes */}
              {services.plasmaBioestimulantes.length > 0 && (
                <section id="plasma" className="mb-20">
                  <div className="flex items-center gap-4 mb-8">
                    <i className="fa-solid fa-syringe text-accent text-2xl" />
                    <h2 className="text-3xl font-bold text-secondary">TRATAMIENTOS CON PLASMA Y BIOESTIMULANTES</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.plasmaBioestimulantes.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              )}

              {/* Neuromoduladores */}
              {services.neuromoduladores.length > 0 && (
                <section id="neuro" className="mb-20">
                  <div className="flex items-center gap-4 mb-8">
                    <i className="fa-solid fa-star text-accent text-2xl" />
                    <h2 className="text-3xl font-bold text-secondary">NEUROMODULADORES Y RELLENOS</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.neuromoduladores.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              )}

              {/* Masajes */}
              {services.masajes.length > 0 && (
                <section id="masajes" className="mb-20">
                  <div className="flex items-center gap-4 mb-8">
                    <i className="fa-solid fa-hand-sparkles text-accent text-2xl" />
                    <h2 className="text-3xl font-bold text-secondary">MASAJES Y RELAJACION</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.masajes.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              )}

              {/* Corporales */}
              {services.corporales.length > 0 && (
                <section id="corporales" className="mb-20">
                  <div className="flex items-center gap-4 mb-8">
                    <i className="fa-solid fa-person-dress text-accent text-2xl" />
                    <h2 className="text-3xl font-bold text-secondary">CORPORALES REDUCTORES Y ANTICELULITICOS</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.corporales.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              )}

              {/* Especiales */}
              {services.especiales.length > 0 && (
                <section id="especiales" className="mb-20">
                  <div className="flex items-center gap-4 mb-8">
                    <i className="fa-solid fa-wand-magic-sparkles text-accent text-2xl" />
                    <h2 className="text-3xl font-bold text-secondary">TRATAMIENTOS ESPECIALES</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.especiales.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ServicesPage;
