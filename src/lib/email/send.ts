'use server'

import { getResend, EMAIL_FROM, ADMIN_EMAIL } from './resend'
import { BookingConfirmationEmail } from './templates/booking-confirmation'
import { AdminNotificationEmail } from './templates/admin-notification'
import { AppointmentReminderEmail } from './templates/appointment-reminder'
import { StaffInvitationEmail } from './templates/staff-invitation'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://estheticforlive.vercel.app'
const WHATSAPP_NUMBER = '573138800396'

function generateWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

interface SendBookingConfirmationParams {
  clientEmail: string
  clientName: string
  serviceName: string
  appointmentDate: Date
  appointmentTime: string
  staffName?: string
}

export async function sendBookingConfirmation({
  clientEmail,
  clientName,
  serviceName,
  appointmentDate,
  appointmentTime,
  staffName,
}: SendBookingConfirmationParams) {
  if (!clientEmail) {
    console.log('No client email provided, skipping confirmation email')
    return { success: false, error: 'No email provided' }
  }

  try {
    const formattedDate = format(appointmentDate, "EEEE d 'de' MMMM, yyyy", { locale: es })
    const whatsappMessage = `Hola, tengo una cita el ${formattedDate} a las ${appointmentTime} para ${serviceName}. `

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: clientEmail,
      subject: `Cita Confirmada - ${serviceName}`,
      react: BookingConfirmationEmail({
        clientName,
        serviceName,
        appointmentDate: formattedDate,
        appointmentTime,
        staffName,
        whatsappLink: generateWhatsAppLink(whatsappMessage),
      }),
    })

    if (error) {
      console.error('Error sending booking confirmation:', error)
      return { success: false, error: error.message }
    }

    console.log('Booking confirmation sent:', data?.id)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending booking confirmation:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

interface SendAdminNotificationParams {
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceName: string
  appointmentDate: Date
  appointmentTime: string
  clientNotes?: string
  appointmentId: string
}

export async function sendAdminNotification({
  clientName,
  clientPhone,
  clientEmail,
  serviceName,
  appointmentDate,
  appointmentTime,
  clientNotes,
  appointmentId,
}: SendAdminNotificationParams) {
  try {
    const formattedDate = format(appointmentDate, "EEEE d 'de' MMMM, yyyy", { locale: es })
    const adminUrl = `${SITE_URL}/admin/reservas/${appointmentId}`

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `Nueva Reserva: ${clientName} - ${serviceName}`,
      react: AdminNotificationEmail({
        clientName,
        clientPhone,
        clientEmail,
        serviceName,
        appointmentDate: formattedDate,
        appointmentTime,
        clientNotes,
        adminUrl,
      }),
    })

    if (error) {
      console.error('Error sending admin notification:', error)
      return { success: false, error: error.message }
    }

    console.log('Admin notification sent:', data?.id)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending admin notification:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

interface SendAppointmentReminderParams {
  clientEmail: string
  clientName: string
  serviceName: string
  appointmentDate: Date
  appointmentTime: string
  staffName?: string
}

export async function sendAppointmentReminder({
  clientEmail,
  clientName,
  serviceName,
  appointmentDate,
  appointmentTime,
  staffName,
}: SendAppointmentReminderParams) {
  if (!clientEmail) {
    console.log('No client email provided, skipping reminder')
    return { success: false, error: 'No email provided' }
  }

  try {
    const formattedDate = format(appointmentDate, "EEEE d 'de' MMMM", { locale: es })
    const whatsappMessage = `Hola, tengo una cita manana a las ${appointmentTime} para ${serviceName}. `

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: clientEmail,
      subject: `Recordatorio: Tu cita es manana - ${serviceName}`,
      react: AppointmentReminderEmail({
        clientName,
        serviceName,
        appointmentDate: formattedDate,
        appointmentTime,
        staffName,
        whatsappLink: generateWhatsAppLink(whatsappMessage),
      }),
    })

    if (error) {
      console.error('Error sending reminder:', error)
      return { success: false, error: error.message }
    }

    console.log('Reminder sent:', data?.id)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending reminder:', error)
    return { success: false, error: 'Failed to send email' }
  }
}

interface SendStaffInvitationParams {
  to: string
  staffName: string
  token: string
}

export async function sendStaffInvitation({
  to,
  staffName,
  token,
}: SendStaffInvitationParams) {
  try {
    const invitationLink = `${SITE_URL}/auth/invitacion?token=${token}`

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: 'Invitacion al Portal de Colaboradores - Esthetic For Live',
      react: StaffInvitationEmail({
        staffName,
        invitationLink,
      }),
    })

    if (error) {
      console.error('Error sending staff invitation:', error)
      return { success: false, error: error.message }
    }

    console.log('Staff invitation sent:', data?.id)
    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending staff invitation:', error)
    return { success: false, error: 'Failed to send invitation email' }
  }
}
