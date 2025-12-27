import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHomePage } from '../../hooks/useHomePage';

const ResultsCarousel = () => {
  const { results, settings, loading } = useHomePage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % results.length);
    setSliderPosition(50);
  }, [results.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
    setSliderPosition(50);
  }, [results.length]);

  // Auto-advance carousel
  useEffect(() => {
    if (results.length <= 1) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide, results.length]);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, x)));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, x)));
  };

  if (loading) {
    return (
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  if (results.length === 0) return null;

  const currentResult = results[currentIndex];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Transformaciones</span>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary mt-2 mb-4">
            {settings.resultsSection.title}
          </h2>
          <p className="text-muted max-w-2xl mx-auto">
            {settings.resultsSection.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Before/After Slider */}
          <div
            className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl cursor-ew-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
          >
            {/* After Image (Background) */}
            <img
              src={currentResult.afterImage}
              alt="Después"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Before Image (Clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={currentResult.beforeImage}
                alt="Antes"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ width: `${100 / (sliderPosition / 100)}%`, maxWidth: 'none' }}
                draggable={false}
              />
            </div>

            {/* Slider Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              {/* Slider Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center">
                <div className="flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4 text-accent" />
                  <ChevronRight className="w-4 h-4 text-accent" />
                </div>
              </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
              Antes
            </div>
            <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
              Después
            </div>

            {/* Navigation Arrows */}
            {results.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                  className="absolute left-4 bottom-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-20"
                >
                  <ChevronLeft className="w-5 h-5 text-secondary" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                  className="absolute right-4 bottom-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all z-20"
                >
                  <ChevronRight className="w-5 h-5 text-secondary" />
                </button>
              </>
            )}
          </div>

          {/* Result Info */}
          <div className="text-center mt-8">
            <h3 className="text-2xl font-bold text-secondary">{currentResult.title}</h3>
            {currentResult.description && (
              <p className="text-muted mt-2">{currentResult.description}</p>
            )}
          </div>

          {/* Dots Navigation */}
          {results.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {results.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setCurrentIndex(index); setSliderPosition(50); }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-accent w-8'
                      : 'bg-border hover:bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResultsCarousel;
