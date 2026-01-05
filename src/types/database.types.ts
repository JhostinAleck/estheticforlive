export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'superadmin' | 'admin' | 'client'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          fa_icon: string
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          fa_icon?: string
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          fa_icon?: string
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string
          short_description: string | null
          price: number | null
          price_note: string | null
          duration_minutes: number
          fa_icon: string
          image_url: string | null
          display_order: number
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description: string
          short_description?: string | null
          price?: number | null
          price_note?: string | null
          duration_minutes?: number
          fa_icon?: string
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string
          short_description?: string | null
          price?: number | null
          price_note?: string | null
          duration_minutes?: number
          fa_icon?: string
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      before_after_results: {
        Row: {
          id: string
          title: string
          description: string | null
          before_image_url: string
          after_image_url: string
          service_id: string | null
          category_id: string | null
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          before_image_url: string
          after_image_url: string
          service_id?: string | null
          category_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          before_image_url?: string
          after_image_url?: string
          service_id?: string | null
          category_id?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      hero_slides: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          description: string | null
          image_url: string
          cta_text: string
          cta_link: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          description?: string | null
          image_url: string
          cta_text?: string
          cta_link?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          description?: string | null
          image_url?: string
          cta_text?: string
          cta_link?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          site_name: string
          logo_url: string | null
          whatsapp_number: string
          whatsapp_message: string | null
          email: string | null
          phone: string | null
          address: string | null
          city: string
          maps_url: string | null
          maps_embed_url: string | null
          instagram_url: string | null
          tiktok_url: string | null
          services_title: string
          services_subtitle: string | null
          results_title: string
          results_subtitle: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          site_name?: string
          logo_url?: string | null
          whatsapp_number?: string
          whatsapp_message?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string
          maps_url?: string | null
          maps_embed_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          services_title?: string
          services_subtitle?: string | null
          results_title?: string
          results_subtitle?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          logo_url?: string | null
          whatsapp_number?: string
          whatsapp_message?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string
          maps_url?: string | null
          maps_embed_url?: string | null
          instagram_url?: string | null
          tiktok_url?: string | null
          services_title?: string
          services_subtitle?: string | null
          results_title?: string
          results_subtitle?: string | null
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          profile_id: string | null
          full_name: string
          email: string | null
          phone: string
          notes: string | null
          total_appointments: number
          last_appointment_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          full_name: string
          email?: string | null
          phone: string
          notes?: string | null
          total_appointments?: number
          last_appointment_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          full_name?: string
          email?: string | null
          phone?: string
          notes?: string | null
          total_appointments?: number
          last_appointment_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      business_hours: {
        Row: {
          id: string
          day_of_week: DayOfWeek
          open_time: string
          close_time: string
          is_closed: boolean
        }
        Insert: {
          id?: string
          day_of_week: DayOfWeek
          open_time: string
          close_time: string
          is_closed?: boolean
        }
        Update: {
          id?: string
          day_of_week?: DayOfWeek
          open_time?: string
          close_time?: string
          is_closed?: boolean
        }
      }
      special_dates: {
        Row: {
          id: string
          date: string
          description: string | null
          is_closed: boolean
          open_time: string | null
          close_time: string | null
        }
        Insert: {
          id?: string
          date: string
          description?: string | null
          is_closed?: boolean
          open_time?: string | null
          close_time?: string | null
        }
        Update: {
          id?: string
          date?: string
          description?: string | null
          is_closed?: boolean
          open_time?: string | null
          close_time?: string | null
        }
      }
      time_blocks: {
        Row: {
          id: string
          start_datetime: string
          end_datetime: string
          reason: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          start_datetime: string
          end_datetime: string
          reason?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          start_datetime?: string
          end_datetime?: string
          reason?: string | null
          created_by?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          service_id: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status: AppointmentStatus
          status_changed_at: string | null
          status_changed_by: string | null
          client_notes: string | null
          admin_notes: string | null
          reminder_sent_at: string | null
          confirmation_sent_at: string | null
          price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_id?: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status?: AppointmentStatus
          status_changed_at?: string | null
          status_changed_by?: string | null
          client_notes?: string | null
          admin_notes?: string | null
          reminder_sent_at?: string | null
          confirmation_sent_at?: string | null
          price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_id?: string | null
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: AppointmentStatus
          status_changed_at?: string | null
          status_changed_by?: string | null
          client_notes?: string | null
          admin_notes?: string | null
          reminder_sent_at?: string | null
          confirmation_sent_at?: string | null
          price?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      appointment_status_history: {
        Row: {
          id: string
          appointment_id: string
          previous_status: AppointmentStatus | null
          new_status: AppointmentStatus
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          previous_status?: AppointmentStatus | null
          new_status: AppointmentStatus
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          previous_status?: AppointmentStatus | null
          new_status?: AppointmentStatus
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          profile_id: string | null
          name: string
          email: string | null
          phone: string | null
          color: string
          avatar_url: string | null
          specialty: string | null
          is_active: boolean
          can_receive_appointments: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          color?: string
          avatar_url?: string | null
          specialty?: string | null
          is_active?: boolean
          can_receive_appointments?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          color?: string
          avatar_url?: string | null
          specialty?: string | null
          is_active?: boolean
          can_receive_appointments?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      staff_services: {
        Row: {
          id: string
          staff_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          service_id: string
          created_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          service_id?: string
          created_at?: string
        }
      }
    }
    Enums: {
      user_role: UserRole
      day_of_week: DayOfWeek
      appointment_status: AppointmentStatus
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Commonly used types
export type Category = Tables<'categories'>
export type Service = Tables<'services'>
export type BeforeAfterResult = Tables<'before_after_results'>
export type HeroSlide = Tables<'hero_slides'>
export type SiteSettings = Tables<'site_settings'>
export type Profile = Tables<'profiles'>
export type Client = Tables<'clients'>
export type BusinessHours = Tables<'business_hours'>
export type SpecialDate = Tables<'special_dates'>
export type TimeBlock = Tables<'time_blocks'>
export type Appointment = Tables<'appointments'>
export type AppointmentStatusHistory = Tables<'appointment_status_history'>
export type Staff = Tables<'staff'>
export type StaffService = Tables<'staff_services'>

// Extended types with relations
export type ServiceWithCategory = Service & {
  category: Category | null
}

export type AppointmentWithDetails = Appointment & {
  client: Client
  service: Service | null
  staff?: Staff | null
}

export type StaffWithServices = Staff & {
  staff_services?: { services: Service }[]
}
