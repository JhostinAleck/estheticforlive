import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = 'https://jaivyakhfkneyvxwmtdt.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaXZ5YWtoZmtuZXl2eHdtdGR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzQ4Njk1OSwiZXhwIjoyMDgzMDYyOTU5fQ.uu43IuYZFr6NkSZauA1N6fSXOTiYIuGT11nhhigxpj8'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupDatabase() {
  console.log('🚀 Iniciando configuración de base de datos...\n')

  try {
    // Step 1: Create admin user
    console.log('1️⃣ Creando usuario admin...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'estheticforlive06@gmail.com',
      password: '3143622241',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin Esthetic For Live'
      }
    })

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log('   ⚠️  Usuario ya existe, continuando...')
      } else {
        throw authError
      }
    } else {
      console.log('   ✅ Usuario creado:', authData.user.email)
    }

    // Step 2: Insert seed data - Categories
    console.log('\n2️⃣ Insertando categorías...')
    const categories = [
      { name: 'Faciales', slug: 'faciales', description: 'Tratamientos especializados para el cuidado y rejuvenecimiento facial', fa_icon: 'fa-solid fa-face-smile', display_order: 1 },
      { name: 'Plasma y Bioestimulantes', slug: 'plasma-bioestimulantes', description: 'Tratamientos con plasma rico en plaquetas y bioestimulación celular', fa_icon: 'fa-solid fa-syringe', display_order: 2 },
      { name: 'Neuromoduladores y Rellenos', slug: 'neuromoduladores', description: 'Tratamientos con toxina botulínica y ácido hialurónico', fa_icon: 'fa-solid fa-wand-magic-sparkles', display_order: 3 },
      { name: 'Masajes y Relajación', slug: 'masajes', description: 'Masajes terapéuticos y tratamientos de relajación', fa_icon: 'fa-solid fa-spa', display_order: 4 },
      { name: 'Corporales', slug: 'corporales', description: 'Tratamientos reductores y anticelulíticos para el cuerpo', fa_icon: 'fa-solid fa-person', display_order: 5 },
      { name: 'Tratamientos Especiales', slug: 'especiales', description: 'Procedimientos especializados y depilación láser', fa_icon: 'fa-solid fa-star', display_order: 6 },
    ]

    const { data: catData, error: catError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select()

    if (catError) throw catError
    console.log(`   ✅ ${catData.length} categorías insertadas`)

    // Get category IDs
    const { data: allCategories } = await supabase.from('categories').select('id, slug')
    const catMap = {}
    allCategories.forEach(c => catMap[c.slug] = c.id)

    // Step 3: Insert services
    console.log('\n3️⃣ Insertando servicios...')
    const services = [
      { category_id: catMap['faciales'], name: 'Limpieza Facial Profunda', slug: 'limpieza-facial-profunda', description: 'Tratamiento completo de limpieza facial que incluye extracción, exfoliación, mascarilla hidratante y protección solar.', short_description: 'Limpieza profunda con extracción y mascarilla hidratante', fa_icon: 'fa-solid fa-droplet', duration_minutes: 60, display_order: 1 },
      { category_id: catMap['faciales'], name: 'Tratamiento para Acné', slug: 'tratamiento-acne', description: 'Tratamiento especializado para pieles con acné. Incluye limpieza profunda, extracción controlada y LED terapia.', short_description: 'Tratamiento especializado para pieles con acné', fa_icon: 'fa-solid fa-shield-virus', duration_minutes: 75, display_order: 2 },
      { category_id: catMap['faciales'], name: 'Nutrilips', slug: 'nutrilips', description: 'Tratamiento de nutrición intensiva para labios resecos o maltratados.', short_description: 'Nutrición intensiva para labios', fa_icon: 'fa-solid fa-lips', duration_minutes: 30, display_order: 3 },
      { category_id: catMap['plasma-bioestimulantes'], name: 'Plasma Rico en Plaquetas', slug: 'plasma-rico-plaquetas', description: 'Tratamiento regenerativo utilizando el plasma de tu propia sangre para estimular la producción de colágeno.', short_description: 'Regeneración celular con tu propio plasma', fa_icon: 'fa-solid fa-vial', duration_minutes: 90, display_order: 1 },
      { category_id: catMap['plasma-bioestimulantes'], name: 'Plasma Capilar', slug: 'plasma-capilar', description: 'Tratamiento para estimular el crecimiento del cabello mediante plasma rico en plaquetas.', short_description: 'Estimulación del crecimiento capilar', fa_icon: 'fa-solid fa-head-side', duration_minutes: 90, display_order: 2 },
      { category_id: catMap['neuromoduladores'], name: 'Bótox', slug: 'botox', description: 'Aplicación de toxina botulínica para suavizar líneas de expresión y arrugas dinámicas.', short_description: 'Suaviza líneas de expresión y arrugas', fa_icon: 'fa-solid fa-eye', duration_minutes: 45, display_order: 1 },
      { category_id: catMap['neuromoduladores'], name: 'Rinomodelación', slug: 'rinomodelacion', description: 'Corrección estética de la nariz sin cirugía mediante ácido hialurónico.', short_description: 'Perfilamiento nasal sin cirugía', fa_icon: 'fa-solid fa-nose', duration_minutes: 45, display_order: 2 },
      { category_id: catMap['neuromoduladores'], name: 'Relleno de Labios', slug: 'relleno-labios', description: 'Aumento y definición de labios con ácido hialurónico.', short_description: 'Aumento y definición natural de labios', fa_icon: 'fa-solid fa-lips', duration_minutes: 45, display_order: 3 },
      { category_id: catMap['masajes'], name: 'Masaje Relajante', slug: 'masaje-relajante', description: 'Masaje corporal completo diseñado para liberar tensiones y promover el bienestar.', short_description: 'Masaje completo para liberar tensiones', fa_icon: 'fa-solid fa-hand-sparkles', duration_minutes: 60, display_order: 1 },
      { category_id: catMap['masajes'], name: 'Drenaje Linfático', slug: 'drenaje-linfatico', description: 'Masaje especializado para estimular el sistema linfático y eliminar toxinas.', short_description: 'Reduce retención de líquidos y toxinas', fa_icon: 'fa-solid fa-water', duration_minutes: 60, display_order: 2 },
      { category_id: catMap['corporales'], name: 'Reducción y Moldeo', slug: 'reduccion-moldeo', description: 'Tratamiento combinado para reducir medidas y moldear la figura.', short_description: 'Reduce medidas y moldea tu figura', fa_icon: 'fa-solid fa-person-dress', duration_minutes: 90, display_order: 1 },
      { category_id: catMap['corporales'], name: 'M.E.L.A', slug: 'mela', description: 'Mini Extracción Lipídica Ambulatoria. Procedimiento mínimamente invasivo para eliminar grasa localizada.', short_description: 'Eliminación de grasa localizada', fa_icon: 'fa-solid fa-weight-scale', duration_minutes: 120, display_order: 2 },
      { category_id: catMap['corporales'], name: 'Tratamiento Anticelulítico', slug: 'tratamiento-anticelulitico', description: 'Combinación de técnicas para combatir la celulitis.', short_description: 'Combate la celulitis de forma efectiva', fa_icon: 'fa-solid fa-burst', duration_minutes: 75, display_order: 3 },
      { category_id: catMap['especiales'], name: 'Cauterización de Verrugas', slug: 'cauterizacion-verrugas', description: 'Eliminación segura de verrugas mediante cauterización.', short_description: 'Eliminación segura de verrugas', fa_icon: 'fa-solid fa-fire', duration_minutes: 30, display_order: 1 },
      { category_id: catMap['especiales'], name: 'Depilación Láser', slug: 'depilacion-laser', description: 'Depilación permanente con tecnología láser de última generación.', short_description: 'Depilación permanente con láser', fa_icon: 'fa-solid fa-bolt', duration_minutes: 45, display_order: 2 },
    ]

    const { data: svcData, error: svcError } = await supabase
      .from('services')
      .upsert(services, { onConflict: 'slug' })
      .select()

    if (svcError) throw svcError
    console.log(`   ✅ ${svcData.length} servicios insertados`)

    // Step 4: Insert hero slides
    console.log('\n4️⃣ Insertando hero slides...')
    const heroSlides = [
      { title: 'Descubre tu mejor versión', subtitle: 'Centro de Estética Profesional', description: 'Expertos en armonización facial y corporal.', image_url: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80', cta_text: 'Agendar Cita', display_order: 1 },
      { title: 'Tratamientos Faciales', subtitle: 'Rejuvenece tu piel', description: 'Limpieza facial, tratamientos anti-edad, plasma rico en plaquetas y más.', image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1920&q=80', cta_text: 'Ver Tratamientos', cta_link: '/servicios#faciales', display_order: 2 },
      { title: 'Armonización Facial', subtitle: 'Sin cirugía, con resultados', description: 'Bótox, rellenos, rinomodelación y más.', image_url: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=1920&q=80', cta_text: 'Conoce más', cta_link: '/servicios#neuromoduladores', display_order: 3 },
    ]

    const { data: heroData, error: heroError } = await supabase
      .from('hero_slides')
      .insert(heroSlides)
      .select()

    if (heroError && !heroError.message.includes('duplicate')) throw heroError
    console.log(`   ✅ Hero slides insertados`)

    // Step 5: Insert before/after results
    console.log('\n5️⃣ Insertando resultados antes/después...')
    const results = [
      { title: 'Limpieza Facial Profunda', description: 'Resultados después de una sesión de limpieza facial profunda', before_image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800&q=80', after_image_url: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80', category_id: catMap['faciales'], display_order: 1 },
      { title: 'Tratamiento Anticelulítico', description: 'Después de 8 sesiones de tratamiento anticelulítico', before_image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', after_image_url: 'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800&q=80', category_id: catMap['corporales'], display_order: 2 },
    ]

    const { error: resultsError } = await supabase
      .from('before_after_results')
      .insert(results)

    if (resultsError && !resultsError.message.includes('duplicate')) throw resultsError
    console.log(`   ✅ Resultados insertados`)

    // Step 6: Update profile to admin
    console.log('\n6️⃣ Actualizando rol de admin...')
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', 'estheticforlive06@gmail.com')

    if (profileError) {
      console.log('   ⚠️  No se pudo actualizar rol (el usuario se creará al hacer login)')
    } else {
      console.log('   ✅ Rol de admin asignado')
    }

    console.log('\n✨ ¡Configuración completada!\n')
    console.log('📌 Credenciales de acceso:')
    console.log('   Email: estheticforlive06@gmail.com')
    console.log('   Password: 3143622241')
    console.log('\n🔗 URL del admin: http://localhost:3001/auth/login')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

setupDatabase()
