import { Service } from '../../types';
import Button from '../ui/Button';
import { useState } from 'react';
import BookingModal from '../ui/BookingModal';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden border border-border hover:border-accent/30 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
        <div className="relative h-48 overflow-hidden">
          {service.image ? (
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-surface-dark flex items-center justify-center">
              <i className={`${service.faIcon} text-4xl text-accent/30`} />
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2.5 rounded-full shadow-sm">
            <i className={`${service.faIcon} text-accent text-lg`} />
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-4 gap-3">
            <h3 className="text-xl font-bold text-secondary group-hover:text-accent transition-colors">{service.name}</h3>
          </div>
          <p className="text-muted mb-6 flex-grow leading-relaxed text-sm">{service.description}</p>
          <div className="pt-4 border-t border-border">
            <Button
              variant="outline"
              className="w-full group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              Agendar Cita
            </Button>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceName={service.name}
      />
    </>
  );
};

export default ServiceCard;
