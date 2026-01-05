import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAppointmentReminder } from '@/lib/email/send'
import { format, addDays } from 'date-fns'

// This endpoint is called by Vercel Cron
// Runs daily at 8:00 AM Colombia time (13:00 UTC)

interface AppointmentWithRelations {
  id: string
  appointment_date: string
  start_time: string
  reminder_sent_at: string | null
  clients: { id: string; full_name: string; email: string | null; phone: string } | null
  services: { name: string } | null
  staff: { name: string } | null
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()

    // Get tomorrow's date
    const tomorrow = addDays(new Date(), 1)
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')

    // Get appointments for tomorrow that are confirmed or pending
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        start_time,
        reminder_sent_at,
        clients (
          id,
          full_name,
          email,
          phone
        ),
        services (
          name
        ),
        staff (
          name
        )
      `)
      .eq('appointment_date', tomorrowStr)
      .in('status', ['pending', 'confirmed'])
      .is('reminder_sent_at', null)

    if (error) {
      console.error('Error fetching appointments:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No appointments to remind',
        count: 0,
      })
    }

    let sentCount = 0
    let failedCount = 0

    // Send reminders
    const typedAppointments = appointments as AppointmentWithRelations[]
    for (const apt of typedAppointments) {
      const client = apt.clients
      const service = apt.services
      const staff = apt.staff

      if (!client?.email) {
        console.log(`Skipping appointment ${apt.id} - no client email`)
        continue
      }

      try {
        const result = await sendAppointmentReminder({
          clientEmail: client.email,
          clientName: client.full_name,
          serviceName: service?.name || 'Servicio',
          appointmentDate: new Date(apt.appointment_date),
          appointmentTime: apt.start_time.slice(0, 5),
          staffName: staff?.name,
        })

        if (result.success) {
          // Mark reminder as sent
          await supabase
            .from('appointments')
            .update({ reminder_sent_at: new Date().toISOString() } as never)
            .eq('id', apt.id)

          sentCount++
          console.log(`Reminder sent for appointment ${apt.id}`)
        } else {
          failedCount++
          console.error(`Failed to send reminder for ${apt.id}:`, result.error)
        }
      } catch (err) {
        failedCount++
        console.error(`Error sending reminder for ${apt.id}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reminders processed`,
      sent: sentCount,
      failed: failedCount,
      total: appointments.length,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
