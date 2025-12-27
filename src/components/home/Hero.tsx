import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Phone, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import { socialMedia } from '../../data/socialMedia';

const slides = [
  {
    id: 1,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Elegant%20spa%20reception%20area%20with%20white%20marble%2C%20bright%20lighting%2C%20pink%20orchids%2C%20luxury%20aesthetic%2C%20high%20key&image_size=landscape_16_9',
    title: 'Armonización Facial',
    subtitle: 'Realza tu belleza natural',
    accent: 'Tratamientos Premium'
  },
  {
    id: 2,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Close-up%20of%20advanced%20laser%20technology%20equipment%20in%20a%20modern%20white%20medical%20clinic%2C%20professional%20setting&image_size=landscape_16_9',
    title: 'Tecnología Láser',
    subtitle: 'Resultados visibles desde la primera sesión',
    accent: 'Última Generación'
  },
  {
    id: 3,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Woman%20relaxing%20after%20body%20treatment%20in%20a%20bright%20white%20spa%20room%2C%20soft%20lighting%2C%20wellness&image_size=landscape_16_9',
    title: 'Cuidado Corporal',
    subtitle: 'Moldea y tonifica tu figura',
    accent: 'Bienestar Integral'
  },
  {
    id: 4,
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Luxury%20aesthetic%20clinic%20interior%2C%20minimalist%20white%20design%2C%20soft%20pink%20accents%2C%20bright%20and%20welcoming&image_size=landscape_16_9',
    title: 'Experiencia Spa',
    subtitle: 'Relájate y rejuvenece',
    accent: 'Ambiente Exclusivo'
  }
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
    setTimeout(() => setIsAnimating(false), 800);
  }, [isAnimating]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setProgress(0);
    setTimeout(() => setIsAnimating(false), 800);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + 2;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentSlide
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-105'
          }`}
        >
          {/* Lighter overlay for white theme compatibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-black/20 z-10" /> 
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover ${
              index === currentSlide ? 'animate-ken-burns' : ''
            }`}
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl">
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-secondary text-sm font-medium mb-6 ${
                isAnimating ? '' : 'animate-fade-in-down'
              }`}
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span>{slides[currentSlide].accent}</span>
            </div>

            {/* Title */}
            <h1
              key={`title-${currentSlide}`}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 md:mb-6 animate-fade-in-up"
            >
              <span className="block text-white drop-shadow-md">
                {slides[currentSlide].title}
              </span>
            </h1>

            {/* Subtitle */}
            <p
              key={`subtitle-${currentSlide}`}
              className="text-lg sm:text-xl md:text-2xl text-white mb-6 md:mb-8 max-w-2xl animate-fade-in-up animation-delay-200 drop-shadow-md"
            >
              {slides[currentSlide].subtitle}
            </p>

            {/* Description */}
            <p className="text-base md:text-lg text-white mb-8 max-w-xl animate-fade-in-up animation-delay-300 hidden sm:block drop-shadow-md font-medium">
              Descubre tu mejor versión con nuestros tratamientos avanzados de medicina estética y tecnología láser de última generación.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up animation-delay-400">
              <a
                href={socialMedia.whatsapp.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="group w-full sm:w-auto shadow-lg shadow-accent/30 bg-accent hover:bg-accent-hover text-white border-none">
                  Agendar Valoración
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="/servicios">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-secondary bg-white/20 backdrop-blur-sm"
                >
                  Ver Servicios
                </Button>
              </a>
            </div>

            {/* Location Info - Mobile */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 text-white text-sm animate-fade-in-up animation-delay-500 font-medium drop-shadow-sm">
              <a
                href={socialMedia.location.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-accent-light transition-colors"
              >
                <MapPin className="w-4 h-4 text-accent" />
                <span>{socialMedia.location.address}</span>
              </a>
              <a
                href={`tel:${socialMedia.whatsapp.phoneNumber.replace(/\s/g, '')}`}
                className="flex items-center gap-2 hover:text-accent-light transition-colors"
              >
                <Phone className="w-4 h-4 text-accent" />
                <span>{socialMedia.whatsapp.phoneNumber}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4">
        {/* Prev Button */}
        <button
          onClick={prevSlide}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-secondary hover:bg-white transition-all group shadow-lg"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Dots with Progress */}
        <div className="flex items-center gap-2 md:gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative group"
              aria-label={`Ir a slide ${index + 1}`}
            >
              <div
                className={`w-12 md:w-16 h-1 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                }`}
              >
                {index === currentSlide && (
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={nextSlide}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center text-secondary hover:bg-white transition-all group shadow-lg"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </section>
  );
};

export default Hero;
