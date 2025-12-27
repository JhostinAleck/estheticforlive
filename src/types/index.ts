export interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  category: string;
  image?: string;
  faIcon: string; // Font Awesome icon class
}

export interface ServicesData {
  faciales: Service[];
  plasmaBioestimulantes: Service[];
  neuromoduladores: Service[];
  masajes: Service[];
  corporales: Service[];
  especiales: Service[];
}

export interface SocialMedia {
  username: string;
  embedUrl?: string;
  phoneNumber?: string;
  message?: string;
  link?: string;
}
