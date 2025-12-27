import { Instagram } from 'lucide-react';
import { socialMedia } from '../../data/socialMedia';

const SocialFeed = () => {
  return (
    <section className="py-24 bg-accent-light relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <span className="text-accent font-medium text-sm uppercase tracking-wider">Redes Sociales</span>
          <h2 className="text-3xl md:text-5xl font-bold text-secondary mt-2 mb-4">Síguenos en Redes</h2>
          <p className="text-muted max-w-2xl mx-auto mb-8">
            Mantente al día con nuestros últimos tratamientos, consejos de belleza y testimonios.
          </p>
          <div className="flex justify-center gap-6">
            <a
              href={`https://instagram.com/${socialMedia.instagram.username.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-accent hover:text-accent-hover transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
            >
              <Instagram className="h-5 w-5" />
              <span className="font-medium">{socialMedia.instagram.username}</span>
            </a>
            <a
              href={`https://tiktok.com/${socialMedia.tiktok.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-accent hover:text-accent-hover transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="font-medium">{socialMedia.tiktok.username}</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Instagram Embed */}
          <div className="bg-white rounded-2xl overflow-hidden aspect-[4/5] border border-border shadow-lg relative group">
            <iframe
              src={socialMedia.instagram.embedUrl}
              className="w-full h-full border-0"
              allowTransparency={true}
              title="Instagram Feed"
            />
            <a
              href={`https://instagram.com/${socialMedia.instagram.username.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-white font-medium bg-accent px-6 py-3 rounded-full">Ver en Instagram</span>
            </a>
          </div>

          {/* TikTok Embed */}
          <div className="bg-white rounded-2xl overflow-hidden aspect-[4/5] border border-border shadow-lg relative group">
            <iframe
              src={socialMedia.tiktok.embedUrl}
              className="w-full h-full border-0"
              allowTransparency={true}
              title="TikTok Feed"
            />
            <a
              href={`https://tiktok.com/${socialMedia.tiktok.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0 bg-secondary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span className="text-white font-medium bg-accent px-6 py-3 rounded-full">Ver en TikTok</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialFeed;
