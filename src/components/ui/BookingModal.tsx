import { useState, FormEvent } from 'react';
import { X, Calendar, User, Phone, MessageSquare, CheckCircle } from 'lucide-react';
import Button from './Button';
import { socialMedia } from '../../data/socialMedia';
import { cn } from '../../utils/cn';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
}

const BookingModal = ({ isOpen, onClose, serviceName }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    date: '',
    details: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API delay/Validation
    setTimeout(() => {
      // Construct WhatsApp message
      const message = `Hola, estoy interesado en ${serviceName}.
      
Mis datos son:
- Nombre: ${formData.name}
- Contacto: ${formData.contact}
- Fecha preferida: ${formData.date}
${formData.details ? `- Detalles adicionales: ${formData.details}` : ''}

Quedo atento a su respuesta.`;

      const whatsappUrl = `https://wa.me/${socialMedia.whatsapp.phoneNumber?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset after 2 seconds and close
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setFormData({ name: '', contact: '', date: '', details: '' });
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-scale-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-secondary transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">¡Mensaje Listo!</h3>
            <p className="text-muted">Te estamos redirigiendo a WhatsApp para completar tu reserva.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-secondary mb-1">Agendar Cita</h2>
              <p className="text-muted text-sm">
                Completando reserva para: <span className="font-semibold text-accent">{serviceName}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <Phone className="w-4 h-4 text-accent" />
                  Teléfono / WhatsApp
                </label>
                <input
                  required
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                  placeholder="300 123 4567"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  Fecha Preferida
                </label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-accent" />
                  Detalles Adicionales (Opcional)
                </label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-border focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all resize-none h-24"
                  placeholder="¿Alguna duda o requerimiento especial?"
                />
              </div>

              <Button 
                type="submit" 
                className={cn(
                  "w-full mt-6 transition-all",
                  isSubmitting ? "opacity-75 cursor-wait" : ""
                )}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Procesando...' : 'Continuar en WhatsApp'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
