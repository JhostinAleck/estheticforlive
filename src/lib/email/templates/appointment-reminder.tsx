import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AppointmentReminderEmailProps {
  clientName: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  staffName?: string
  whatsappLink: string
}

export function AppointmentReminderEmail({
  clientName,
  serviceName,
  appointmentDate,
  appointmentTime,
  staffName,
  whatsappLink,
}: AppointmentReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Recordatorio: Tu cita es manana - {serviceName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={reminderBadge}>RECORDATORIO</Text>
            <Heading style={logo}>Esthetic For Live</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Tu cita es manana!</Heading>

            <Text style={paragraph}>
              Hola <strong>{clientName}</strong>,
            </Text>

            <Text style={paragraph}>
              Te recordamos que tienes una cita programada para manana. Aqui estan los detalles:
            </Text>

            {/* Appointment Details Box */}
            <Section style={detailsBox}>
              <Text style={detailRow}>
                <span style={detailLabel}>Servicio:</span>
                <span style={detailValue}>{serviceName}</span>
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Fecha:</span>
                <span style={detailValue}>{appointmentDate}</span>
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Hora:</span>
                <span style={detailValue}>{appointmentTime}</span>
              </Text>
              {staffName && (
                <Text style={detailRow}>
                  <span style={detailLabel}>Atendido por:</span>
                  <span style={detailValue}>{staffName}</span>
                </Text>
              )}
            </Section>

            {/* Tips */}
            <Section style={tipsBox}>
              <Text style={tipsTitle}>Recomendaciones:</Text>
              <Text style={tipItem}>- Llega 10 minutos antes de tu cita</Text>
              <Text style={tipItem}>- Ven con ropa comoda</Text>
              <Text style={tipItem}>- Si necesitas cancelar, avisanos con anticipacion</Text>
            </Section>

            <Text style={paragraph}>
              Si no puedes asistir o necesitas cambiar la hora, contactanos:
            </Text>

            <Section style={buttonContainer}>
              <Link href={whatsappLink} style={button}>
                Contactar por WhatsApp
              </Link>
            </Section>

            <Hr style={hr} />

            <Text style={smallText}>
              Te esperamos!
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Esthetic For Live
            </Text>
            <Text style={footerText}>
              Calle 4 No 5-40 Garcia Rovira, La Plata, Huila
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#FEF7F8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '560px',
}

const header = {
  backgroundColor: '#E91E63',
  padding: '30px 40px',
  borderRadius: '16px 16px 0 0',
  textAlign: 'center' as const,
}

const reminderBadge = {
  backgroundColor: '#ffffff',
  borderRadius: '20px',
  color: '#E91E63',
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '6px 16px',
  margin: '0 0 12px',
}

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
}

const content = {
  backgroundColor: '#ffffff',
  padding: '40px',
}

const h1 = {
  color: '#1a1a2e',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#4a4a4a',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const detailsBox = {
  backgroundColor: '#FEF7F8',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  borderLeft: '4px solid #E91E63',
}

const detailRow = {
  margin: '0 0 12px',
  fontSize: '15px',
  color: '#1a1a2e',
}

const detailLabel = {
  color: '#6b7280',
  display: 'inline-block',
  width: '120px',
}

const detailValue = {
  fontWeight: '600',
}

const tipsBox = {
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  padding: '20px',
  margin: '24px 0',
}

const tipsTitle = {
  color: '#166534',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const tipItem = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#25D366',
  borderRadius: '12px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
}

const smallText = {
  color: '#E91E63',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
}

const footer = {
  backgroundColor: '#f3f4f6',
  padding: '30px 40px',
  borderRadius: '0 0 16px 16px',
}

const footerText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 4px',
  textAlign: 'center' as const,
}

export default AppointmentReminderEmail
