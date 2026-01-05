-- =============================================
-- SEED DATA - Initial Content
-- =============================================

-- Categories
INSERT INTO categories (name, slug, description, fa_icon, display_order, is_active) VALUES
  ('Faciales', 'faciales', 'Tratamientos especializados para el cuidado y rejuvenecimiento facial', 'fa-solid fa-face-smile', 1, true),
  ('Plasma y Bioestimulantes', 'plasma-bioestimulantes', 'Tratamientos con plasma rico en plaquetas y bioestimulación celular', 'fa-solid fa-syringe', 2, true),
  ('Neuromoduladores y Rellenos', 'neuromoduladores', 'Tratamientos con toxina botulínica y ácido hialurónico', 'fa-solid fa-wand-magic-sparkles', 3, true),
  ('Masajes y Relajación', 'masajes', 'Masajes terapéuticos y tratamientos de relajación', 'fa-solid fa-spa', 4, true),
  ('Corporales', 'corporales', 'Tratamientos reductores y anticelulíticos para el cuerpo', 'fa-solid fa-person', 5, true),
  ('Tratamientos Especiales', 'especiales', 'Procedimientos especializados y depilación láser', 'fa-solid fa-star', 6, true);

-- Services
INSERT INTO services (category_id, name, slug, description, short_description, fa_icon, duration_minutes, display_order, is_active) VALUES
  -- Faciales
  ((SELECT id FROM categories WHERE slug = 'faciales'), 'Limpieza Facial Profunda', 'limpieza-facial-profunda', 'Tratamiento completo de limpieza facial que incluye extracción, exfoliación, mascarilla hidratante y protección solar. Ideal para todo tipo de piel.', 'Limpieza profunda con extracción y mascarilla hidratante', 'fa-solid fa-droplet', 60, 1, true),
  ((SELECT id FROM categories WHERE slug = 'faciales'), 'Tratamiento para Acné', 'tratamiento-acne', 'Tratamiento especializado para pieles con acné. Incluye limpieza profunda, extracción controlada, aplicación de productos específicos y LED terapia.', 'Tratamiento especializado para pieles con acné', 'fa-solid fa-shield-virus', 75, 2, true),
  ((SELECT id FROM categories WHERE slug = 'faciales'), 'Nutrilips', 'nutrilips', 'Tratamiento de nutrición intensiva para labios resecos o maltratados. Exfoliación suave, hidratación profunda y protección.', 'Nutrición intensiva para labios', 'fa-solid fa-lips', 30, 3, true),

  -- Plasma y Bioestimulantes
  ((SELECT id FROM categories WHERE slug = 'plasma-bioestimulantes'), 'Plasma Rico en Plaquetas', 'plasma-rico-plaquetas', 'Tratamiento regenerativo utilizando el plasma de tu propia sangre para estimular la producción de colágeno y rejuvenecer la piel.', 'Regeneración celular con tu propio plasma', 'fa-solid fa-vial', 90, 1, true),
  ((SELECT id FROM categories WHERE slug = 'plasma-bioestimulantes'), 'Plasma Capilar', 'plasma-capilar', 'Tratamiento para estimular el crecimiento del cabello y fortalecer el cuero cabelludo mediante la aplicación de plasma rico en plaquetas.', 'Estimulación del crecimiento capilar', 'fa-solid fa-head-side', 90, 2, true),

  -- Neuromoduladores y Rellenos
  ((SELECT id FROM categories WHERE slug = 'neuromoduladores'), 'Bótox', 'botox', 'Aplicación de toxina botulínica para suavizar líneas de expresión y arrugas dinámicas. Resultados naturales y seguros.', 'Suaviza líneas de expresión y arrugas', 'fa-solid fa-eye', 45, 1, true),
  ((SELECT id FROM categories WHERE slug = 'neuromoduladores'), 'Rinomodelación', 'rinomodelacion', 'Corrección estética de la nariz sin cirugía mediante ácido hialurónico. Resultados inmediatos y reversibles.', 'Perfilamiento nasal sin cirugía', 'fa-solid fa-nose', 45, 2, true),
  ((SELECT id FROM categories WHERE slug = 'neuromoduladores'), 'Relleno de Labios', 'relleno-labios', 'Aumento y definición de labios con ácido hialurónico. Resultados naturales y personalizados según tus deseos.', 'Aumento y definición natural de labios', 'fa-solid fa-lips', 45, 3, true),

  -- Masajes
  ((SELECT id FROM categories WHERE slug = 'masajes'), 'Masaje Relajante', 'masaje-relajante', 'Masaje corporal completo diseñado para liberar tensiones y promover el bienestar general. Técnicas suaves y aceites aromáticos.', 'Masaje completo para liberar tensiones', 'fa-solid fa-hand-sparkles', 60, 1, true),
  ((SELECT id FROM categories WHERE slug = 'masajes'), 'Drenaje Linfático', 'drenaje-linfatico', 'Masaje especializado para estimular el sistema linfático, reducir retención de líquidos y eliminar toxinas.', 'Reduce retención de líquidos y toxinas', 'fa-solid fa-water', 60, 2, true),

  -- Corporales
  ((SELECT id FROM categories WHERE slug = 'corporales'), 'Reducción y Moldeo', 'reduccion-moldeo', 'Tratamiento combinado para reducir medidas y moldear la figura. Incluye masajes reductores, radiofrecuencia y vendas frías.', 'Reduce medidas y moldea tu figura', 'fa-solid fa-person-dress', 90, 1, true),
  ((SELECT id FROM categories WHERE slug = 'corporales'), 'M.E.L.A', 'mela', 'Mini Extracción Lipídica Ambulatoria. Procedimiento mínimamente invasivo para eliminar grasa localizada.', 'Eliminación de grasa localizada', 'fa-solid fa-weight-scale', 120, 2, true),
  ((SELECT id FROM categories WHERE slug = 'corporales'), 'Tratamiento Anticelulítico', 'tratamiento-anticelulitico', 'Combinación de técnicas para combatir la celulitis: masajes, radiofrecuencia, presoterapia y productos específicos.', 'Combate la celulitis de forma efectiva', 'fa-solid fa-burst', 75, 3, true),

  -- Especiales
  ((SELECT id FROM categories WHERE slug = 'especiales'), 'Cauterización de Verrugas', 'cauterizacion-verrugas', 'Eliminación segura de verrugas mediante cauterización. Procedimiento rápido con resultados permanentes.', 'Eliminación segura de verrugas', 'fa-solid fa-fire', 30, 1, true),
  ((SELECT id FROM categories WHERE slug = 'especiales'), 'Depilación Láser', 'depilacion-laser', 'Depilación permanente con tecnología láser de última generación. Sesiones rápidas y efectivas para cualquier zona del cuerpo.', 'Depilación permanente con láser', 'fa-solid fa-bolt', 45, 2, true);

-- Hero Slides
INSERT INTO hero_slides (title, subtitle, description, image_url, cta_text, cta_link, display_order, is_active) VALUES
  ('Descubre tu mejor versión', 'Centro de Estética Profesional', 'Expertos en armonización facial y corporal. Combinamos tecnología avanzada con técnicas especializadas para resaltar tu belleza natural.', 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80', 'Agendar Cita', NULL, 1, true),
  ('Tratamientos Faciales', 'Rejuvenece tu piel', 'Limpieza facial, tratamientos anti-edad, plasma rico en plaquetas y más. Tecnología de vanguardia para resultados visibles.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1920&q=80', 'Ver Tratamientos', '/servicios#faciales', 2, true),
  ('Armonización Facial', 'Sin cirugía, con resultados', 'Bótox, rellenos, rinomodelación y más. Procedimientos seguros con resultados naturales que realzan tu belleza.', 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1920&q=80', 'Conoce más', '/servicios#neuromoduladores', 3, true);

-- Before/After Results
INSERT INTO before_after_results (title, description, before_image_url, after_image_url, category_id, display_order, is_active) VALUES
  ('Limpieza Facial Profunda', 'Resultados después de una sesión de limpieza facial profunda', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80', 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80', (SELECT id FROM categories WHERE slug = 'faciales'), 1, true),
  ('Tratamiento Anticelulítico', 'Después de 8 sesiones de tratamiento anticelulítico', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800&q=80', (SELECT id FROM categories WHERE slug = 'corporales'), 2, true);
