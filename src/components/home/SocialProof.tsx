import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

const cases = [
  {
    id: 1,
    title: 'Rinomodelación',
    description: 'Perfilamiento nasal sin cirugía',
    imageBefore: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Side%20profile%20of%20a%20nose%20before%20aesthetic%20treatment%2C%20clinical%20photography%2C%20neutral%20background&image_size=portrait_4_3',
    imageAfter: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Side%20profile%20of%20a%20nose%20after%20aesthetic%20treatment%2C%20perfect%20shape%2C%20clinical%20photography%2C%20neutral%20background&image_size=portrait_4_3',
  },
  {
    id: 2,
    title: 'M.E.L.A',
    description: 'Reducción de grasa localizada',
    imageBefore: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Abdomen%20area%20before%20fat%20reduction%20treatment%2C%20clinical%20photography&image_size=portrait_4_3',
    imageAfter: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Toned%20abdomen%20area%20after%20fat%20reduction%20treatment%2C%20clinical%20photography&image_size=portrait_4_3',
  },
  {
    id: 3,
    title: 'Tratamiento Acné',
    description: 'Recuperación de textura y salud',
    imageBefore: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Close%20up%20face%20with%20acne%2C%20clinical%20photography&image_size=portrait_4_3',
    imageAfter: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Close%20up%20face%20with%20clear%20smooth%20skin%2C%20clinical%20photography&image_size=portrait_4_3',
  },
];

const SocialProof = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 400;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-24 bg-white border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <span className="text-accent font-medium text-sm uppercase tracking-wider">Transformaciones</span>
            <h2 className="text-3xl md:text-5xl font-bold text-secondary mt-2 mb-4">Resultados Reales</h2>
            <p className="text-muted max-w-xl">
              Transformaciones que hablan por sí solas. Descubre el antes y después de nuestros pacientes más felices.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => scroll('left')} aria-label="Anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => scroll('right')} aria-label="Siguiente">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cases.map((item) => (
            <div
              key={item.id}
              className="min-w-[300px] md:min-w-[400px] snap-center bg-white rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative h-64 md:h-80 flex">
                <div className="w-1/2 relative border-r border-border">
                  <img src={item.imageBefore} alt={`Antes ${item.title}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 left-3 bg-secondary/80 text-white text-xs px-3 py-1 rounded-full font-medium">Antes</span>
                </div>
                <div className="w-1/2 relative">
                  <img src={item.imageAfter} alt={`Después ${item.title}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 right-3 bg-accent text-white text-xs px-3 py-1 rounded-full font-medium">Después</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-secondary mb-1">{item.title}</h3>
                <p className="text-muted text-sm">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
