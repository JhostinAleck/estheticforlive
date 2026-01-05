-- =============================================
-- ESTHETIC FOR LIVE - EJECUTAR TODO JUNTO
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'client');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  fa_icon VARCHAR(50) DEFAULT 'fa-solid fa-spa',
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(255),
  price DECIMAL(10,2),
  price_note VARCHAR(100),
  duration_minutes INT DEFAULT 60,
  fa_icon VARCHAR(50) DEFAULT 'fa-solid fa-spa',
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Before/After Results
CREATE TABLE IF NOT EXISTS before_after_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(150) NOT NULL,
  description TEXT,
  before_image_url TEXT NOT NULL,
  after_image_url TEXT NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Slides
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(150) NOT NULL,
  subtitle VARCHAR(150),
  description TEXT,
  image_url TEXT NOT NULL,
  cta_text VARCHAR(50) DEFAULT 'Agendar Cita',
  cta_link VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(100) DEFAULT 'Esthetic For Live',
  logo_url TEXT,
  whatsapp_number VARCHAR(20) DEFAULT '+573138800396',
  whatsapp_message TEXT DEFAULT 'Hola, me gustaría agendar una valoración',
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT DEFAULT 'Calle 4 No 5-40 García Rovira, La Plata',
  city VARCHAR(100) DEFAULT 'La Plata, Huila',
  maps_url TEXT,
  maps_embed_url TEXT,
  instagram_url TEXT DEFAULT 'https://www.instagram.com/estheticforlivee',
  tiktok_url TEXT DEFAULT 'https://www.tiktok.com/@esthetic.for.live',
  services_title VARCHAR(100) DEFAULT 'Nuestros Servicios',
  services_subtitle TEXT DEFAULT 'Explora nuestra amplia gama de tratamientos estéticos diseñados para realzar tu belleza natural',
  results_title VARCHAR(100) DEFAULT 'Resultados Reales',
  results_subtitle TEXT DEFAULT 'Transformaciones que hablan por sí solas',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(150),
  phone VARCHAR(20),
  avatar_url TEXT,
  role user_role DEFAULT 'client',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  notes TEXT,
  total_appointments INT DEFAULT 0,
  last_appointment_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Hours
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week day_of_week NOT NULL UNIQUE,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false
);

-- Special Dates
CREATE TABLE IF NOT EXISTS special_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  description VARCHAR(150),
  is_closed BOOLEAN DEFAULT true,
  open_time TIME,
  close_time TIME
);

-- Time Blocks
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  reason VARCHAR(150),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status DEFAULT 'pending',
  status_changed_at TIMESTAMPTZ,
  status_changed_by UUID REFERENCES profiles(id),
  client_notes TEXT,
  admin_notes TEXT,
  reminder_sent_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment Status History
CREATE TABLE IF NOT EXISTS appointment_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  previous_status appointment_status,
  new_status appointment_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_profile ON clients(profile_id);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_client_appointments(p_client_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE clients
  SET total_appointments = total_appointments + 1, last_appointment_at = NOW()
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGERS (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_hero_slides_updated_at ON hero_slides;
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE before_after_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
DROP POLICY IF EXISTS "Public can read active categories" ON categories;
DROP POLICY IF EXISTS "Public can read active services" ON services;
DROP POLICY IF EXISTS "Public can read active hero slides" ON hero_slides;
DROP POLICY IF EXISTS "Public can read active results" ON before_after_results;
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Public can read business hours" ON business_hours;
DROP POLICY IF EXISTS "Public can read special dates" ON special_dates;
DROP POLICY IF EXISTS "Admins can do everything on categories" ON categories;
DROP POLICY IF EXISTS "Admins can do everything on services" ON services;
DROP POLICY IF EXISTS "Admins can do everything on hero_slides" ON hero_slides;
DROP POLICY IF EXISTS "Admins can do everything on before_after_results" ON before_after_results;
DROP POLICY IF EXISTS "Admins can do everything on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can do everything on business_hours" ON business_hours;
DROP POLICY IF EXISTS "Admins can do everything on special_dates" ON special_dates;
DROP POLICY IF EXISTS "Admins can do everything on time_blocks" ON time_blocks;
DROP POLICY IF EXISTS "Admins can do everything on appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can do everything on clients" ON clients;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Clients can view own appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can create clients" ON clients;
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;

CREATE POLICY "Public can read active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active hero slides" ON hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read active results" ON before_after_results FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read site settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can read business hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "Public can read special dates" ON special_dates FOR SELECT USING (true);

CREATE POLICY "Admins can do everything on categories" ON categories FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on services" ON services FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on hero_slides" ON hero_slides FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on before_after_results" ON before_after_results FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on site_settings" ON site_settings FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on business_hours" ON business_hours FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on special_dates" ON special_dates FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on time_blocks" ON time_blocks FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on appointments" ON appointments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can do everything on clients" ON clients FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin')));
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Clients can view own appointments" ON appointments FOR SELECT USING (client_id IN (SELECT id FROM clients WHERE profile_id = auth.uid()));
CREATE POLICY "Anyone can create clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create appointments" ON appointments FOR INSERT WITH CHECK (true);

-- INITIAL DATA
INSERT INTO site_settings (id) VALUES (uuid_generate_v4()) ON CONFLICT DO NOTHING;

INSERT INTO business_hours (day_of_week, open_time, close_time, is_closed) VALUES
  ('monday', '08:00', '18:00', false),
  ('tuesday', '08:00', '18:00', false),
  ('wednesday', '08:00', '18:00', false),
  ('thursday', '08:00', '18:00', false),
  ('friday', '08:00', '18:00', false),
  ('saturday', '08:00', '14:00', false),
  ('sunday', '00:00', '00:00', true)
ON CONFLICT (day_of_week) DO NOTHING;

-- SEED DATA
INSERT INTO categories (name, slug, description, fa_icon, display_order) VALUES
  ('Faciales', 'faciales', 'Tratamientos especializados para el cuidado y rejuvenecimiento facial', 'fa-solid fa-face-smile', 1),
  ('Plasma y Bioestimulantes', 'plasma-bioestimulantes', 'Tratamientos con plasma rico en plaquetas y bioestimulación celular', 'fa-solid fa-syringe', 2),
  ('Neuromoduladores y Rellenos', 'neuromoduladores', 'Tratamientos con toxina botulínica y ácido hialurónico', 'fa-solid fa-wand-magic-sparkles', 3),
  ('Masajes y Relajación', 'masajes', 'Masajes terapéuticos y tratamientos de relajación', 'fa-solid fa-spa', 4),
  ('Corporales', 'corporales', 'Tratamientos reductores y anticelulíticos para el cuerpo', 'fa-solid fa-person', 5),
  ('Tratamientos Especiales', 'especiales', 'Procedimientos especializados y depilación láser', 'fa-solid fa-star', 6)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO services (category_id, name, slug, description, short_description, fa_icon, duration_minutes, display_order) VALUES
  ((SELECT id FROM categories WHERE slug = 'faciales'), 'Limpieza Facial Profunda', 'limpieza-facial-profunda', 'Tratamiento completo de limpieza facial.', 'Limpieza profunda con extracción', 'fa-solid fa-droplet', 60, 1),
  ((SELECT id FROM categories WHERE slug = 'faciales'), 'Tratamiento para Acné', 'tratamiento-acne', 'Tratamiento especializado para pieles con acné.', 'Tratamiento especializado para acné', 'fa-solid fa-shield-virus', 75, 2),
  ((SELECT id FROM categories WHERE slug = 'plasma-bioestimulantes'), 'Plasma Rico en Plaquetas', 'plasma-rico-plaquetas', 'Tratamiento regenerativo con plasma.', 'Regeneración celular', 'fa-solid fa-vial', 90, 1),
  ((SELECT id FROM categories WHERE slug = 'neuromoduladores'), 'Bótox', 'botox', 'Aplicación de toxina botulínica.', 'Suaviza líneas de expresión', 'fa-solid fa-eye', 45, 1),
  ((SELECT id FROM categories WHERE slug = 'neuromoduladores'), 'Relleno de Labios', 'relleno-labios', 'Aumento de labios con ácido hialurónico.', 'Aumento natural de labios', 'fa-solid fa-lips', 45, 2),
  ((SELECT id FROM categories WHERE slug = 'masajes'), 'Masaje Relajante', 'masaje-relajante', 'Masaje corporal completo.', 'Masaje para liberar tensiones', 'fa-solid fa-hand-sparkles', 60, 1),
  ((SELECT id FROM categories WHERE slug = 'corporales'), 'Reducción y Moldeo', 'reduccion-moldeo', 'Tratamiento para reducir medidas.', 'Reduce medidas y moldea', 'fa-solid fa-person-dress', 90, 1),
  ((SELECT id FROM categories WHERE slug = 'especiales'), 'Depilación Láser', 'depilacion-laser', 'Depilación permanente con láser.', 'Depilación permanente', 'fa-solid fa-bolt', 45, 1)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO hero_slides (title, subtitle, description, image_url, cta_text, display_order) VALUES
  ('Descubre tu mejor versión', 'Centro de Estética Profesional', 'Expertos en armonización facial y corporal.', 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80', 'Agendar Cita', 1),
  ('Tratamientos Faciales', 'Rejuvenece tu piel', 'Limpieza facial, tratamientos anti-edad y más.', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1920&q=80', 'Ver Tratamientos', 2)
ON CONFLICT DO NOTHING;

-- CREATE PROFILE FOR ADMIN USER (if exists)
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Admin Esthetic For Live', 'admin'
FROM auth.users
WHERE email = 'estheticforlive06@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';

SELECT 'SUCCESS: Database setup complete!' as result;
