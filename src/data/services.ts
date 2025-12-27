export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  faIcon: string; // Font Awesome icon class
}

export const services = {
  faciales: [
    {
      id: 'facial-1',
      name: 'Limpieza Facial Profunda',
      description: 'Renovación total de la piel. Elimina impurezas y células muertas para un rostro fresco.',
      category: 'FACIALES',
      faIcon: 'fa-solid fa-spa',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Close-up%20of%20a%20woman%20receiving%20a%20deep%20facial%20cleansing%20in%20a%20bright%2C%20white%2C%20clinical%20aesthetic%20setting%2C%20soft%20lighting%2C%20high%20key%20photography&image_size=portrait_4_3'
    },
    {
      id: 'facial-2',
      name: 'Tratamiento para Acné',
      description: 'Protocolos especializados para controlar brotes, reducir inflamación y mejorar la textura de la piel.',
      category: 'FACIALES',
      faIcon: 'fa-solid fa-droplet',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20acne%20treatment%20procedure%20in%20a%20clean%2C%20white%20medical%20spa%20environment%2C%20dermatology%2C%20soft%20focus%2C%20bright%20lighting&image_size=portrait_4_3'
    },
    {
      id: 'facial-3',
      name: 'Nutrilips',
      description: 'Nutrición profunda, hidratación y revitalización del color natural de tus labios.',
      category: 'FACIALES',
      faIcon: 'fa-solid fa-lips',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Close-up%20of%20hydrated%2C%20glossy%20lips%20after%20aesthetic%20treatment%2C%20bright%2C%20clean%20background%2C%20beauty%20photography&image_size=portrait_4_3'
    }
  ],
  plasmaBioestimulantes: [
    {
      id: 'plasma-1',
      name: 'Plasma Rico en Plaquetas',
      description: 'Bioestimulación cutánea para regenerar tejidos y mejorar la calidad de la piel.',
      category: 'TRATAMIENTOS CON PLASMA Y BIOESTIMULANTES',
      faIcon: 'fa-solid fa-syringe',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=PRP%20treatment%20preparation%20in%20a%20sterile%2C%20white%20clinical%20setting%2C%20medical%20aesthetics%2C%20bright%20and%20clean&image_size=portrait_4_3'
    },
    {
      id: 'plasma-2',
      name: 'Plasma Capilar',
      description: 'Fortalece el folículo piloso y estimula el crecimiento del cabello.',
      category: 'TRATAMIENTOS CON PLASMA Y BIOESTIMULANTES',
      faIcon: 'fa-solid fa-head-side',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Hair%20prp%20treatment%20application%2C%20scalp%20therapy%2C%20medical%20clinic%2C%20white%20background%2C%20professional&image_size=portrait_4_3'
    }
  ],
  neuromoduladores: [
    {
      id: 'neuro-1',
      name: 'Bótox',
      description: 'Suaviza líneas de expresión y previene arrugas manteniendo la naturalidad.',
      category: 'NEUROMODULADORES Y RELLENOS',
      faIcon: 'fa-solid fa-star',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Botox%20injection%20procedure%20on%20forehead%2C%20medical%20aesthetic%20clinic%2C%20clean%20white%20aesthetic%2C%20professional&image_size=portrait_4_3'
    },
    {
      id: 'neuro-2',
      name: 'Rinomodelación',
      description: 'Perfilamiento nasal sin cirugía con ácido hialurónico.',
      category: 'NEUROMODULADORES Y RELLENOS',
      faIcon: 'fa-solid fa-nose',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Non-surgical%20rhinoplasty%20consultation%2C%20side%20profile%2C%20beauty%20clinic%2C%20bright%20white%20interior&image_size=portrait_4_3'
    },
    {
      id: 'neuro-3',
      name: 'Relleno de Labios',
      description: 'Aumento de volumen y definición de labios con resultados naturales.',
      category: 'NEUROMODULADORES Y RELLENOS',
      faIcon: 'fa-solid fa-face-kiss',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Lip%20filler%20aesthetic%20procedure%2C%20close%20up%2C%20medical%20spa%2C%20white%20clean%20look&image_size=portrait_4_3'
    }
  ],
  masajes: [
    {
      id: 'masaje-1',
      name: 'Masaje Relajante',
      description: 'Técnicas manuales para aliviar tensión muscular y reducir el estrés.',
      category: 'MASAJES Y RELAJACIÓN',
      faIcon: 'fa-solid fa-hand-sparkles',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Relaxing%20back%20massage%20in%20a%20luxury%20spa%2C%20white%20towels%2C%20peaceful%20bright%20atmosphere%2C%20candles&image_size=portrait_4_3'
    },
    {
      id: 'masaje-2',
      name: 'Drenaje Linfático',
      description: 'Masaje suave que favorece la eliminación de toxinas y reduce la retención de líquidos.',
      category: 'MASAJES Y RELAJACIÓN',
      faIcon: 'fa-solid fa-water',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Lymphatic%20drainage%20massage%20therapy%2C%20spa%20setting%2C%20white%20and%20minimalist%20decor&image_size=portrait_4_3'
    }
  ],
  corporales: [
    {
      id: 'corp-1',
      name: 'Reducción y Moldeo',
      description: 'Tratamiento integral para reducir medidas y moldear el contorno corporal.',
      category: 'CORPORALES REDUCTORES Y ANTICELULÍTICOS',
      faIcon: 'fa-solid fa-person-dress',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Body%20contouring%20treatment%20device%20application%20on%20abdomen%2C%20white%20medical%20aesthetic%20room&image_size=portrait_4_3'
    },
    {
      id: 'corp-2',
      name: 'M.E.L.A',
      description: 'Mini Extracción Lipídica Ambulatoria para grasa localizada.',
      category: 'CORPORALES REDUCTORES Y ANTICELULÍTICOS',
      faIcon: 'fa-solid fa-weight-scale',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Doctor%20consulting%20patient%20for%20body%20treatment%2C%20standing%20in%20modern%20white%20clinic&image_size=portrait_4_3'
    },
    {
      id: 'corp-3',
      name: 'Tratamiento Anticelulítico',
      description: 'Mejora la apariencia de la piel de naranja y la circulación.',
      category: 'CORPORALES REDUCTORES Y ANTICELULÍTICOS',
      faIcon: 'fa-solid fa-circle-nodes',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Anti-cellulite%20massage%20treatment%20on%20legs%2C%20aesthetic%20clinic%2C%20bright%20and%20clean&image_size=portrait_4_3'
    }
  ],
  especiales: [
    {
      id: 'esp-1',
      name: 'Cauterización de Verrugas',
      description: 'Eliminación segura de verrugas y lunares benignos.',
      category: 'TRATAMIENTOS ESPECIALES',
      faIcon: 'fa-solid fa-bolt',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Dermatology%20consultation%20for%20skin%20lesion%20removal%2C%20white%20clinical%20environment%2C%20professional&image_size=portrait_4_3'
    },
    {
      id: 'esp-2',
      name: 'Depilación Láser',
      description: 'Eliminación progresiva del vello con tecnología láser de última generación.',
      category: 'TRATAMIENTOS ESPECIALES',
      faIcon: 'fa-solid fa-wand-magic-sparkles',
      image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Laser%20hair%20removal%20treatment%20on%20legs%2C%20modern%20laser%20device%2C%20white%20aesthetic%20clinic&image_size=portrait_4_3'
    }
  ]
};
