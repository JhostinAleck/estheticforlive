import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import { socialMedia } from '../../data/socialMedia';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Servicios', path: '/servicios' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-500',
        scrolled || !isHome
          ? 'bg-white/95 backdrop-blur-md py-3 shadow-sm'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/esthetic-logo.png"
            alt="Esthetic For Live"
            className="h-10 md:h-12 w-auto object-contain transition-all duration-300"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-medium transition-all duration-300 relative py-1 px-2 rounded-md',
                  location.pathname === link.path
                    ? 'text-accent font-bold'
                    : 'text-secondary hover:text-accent hover:bg-accent-light/50'
                )}
                style={!scrolled && isHome ? { textShadow: '0 1px 2px rgba(255,255,255,0.8)' } : undefined}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-full" />
                )}
              </Link>
            ))}
          </div>
          <a
            href={socialMedia.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm">
              Agendar Cita
            </Button>
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden transition-colors p-2 rounded-lg text-secondary hover:text-accent hover:bg-accent-light"
          style={!scrolled && isHome ? { filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.8))' } : undefined}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden absolute top-full left-0 w-full bg-white border-t border-border shadow-lg transition-all duration-300 overflow-hidden',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-base font-medium py-3 px-4 rounded-xl transition-colors',
                location.pathname === link.path ? 'text-accent bg-accent-light' : 'text-secondary hover:bg-surface'
              )}
            >
              {link.name}
            </Link>
          ))}
          <a
            href={socialMedia.whatsapp.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-2"
          >
            <Button className="w-full">Agendar Cita</Button>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
