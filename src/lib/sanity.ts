import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: '0smv6jyl',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true, // CDN habilitado - no tiene restricciones CORS
  // Para ver cambios inmediatos, agrega tu dominio a CORS en sanity.io/manage
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: unknown) {
  return builder.image(source);
}
