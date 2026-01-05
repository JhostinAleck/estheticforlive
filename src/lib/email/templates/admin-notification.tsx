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

interface AdminNotificationEmailProps {
  clientName: string
  clientPhone: string
  clientEmail?: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  clientNotes?: string
  adminUrl: string
}

export function AdminNotificationEmail({
  clientName,
  clientPhone,
  clientEmail,
  serviceName,
  appointmentDate,
  appointmentTime,
  clientNotes,
  adminUrl,
}: AdminNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nueva reserva de {clientName} - {serviceName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Nueva Reserva</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={alertBadge}>NUEVA CITA</Text>

            <Heading style={h1}>{serviceName}</Heading>

            {/* Client Details */}
            <Section style={detailsBox}>
              <Text style={sectionTitle}>Datos del Cliente</Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Nombre:</span>
                <span style={detailValue}>{clientName}</span>
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Telefono:</span>
                <Link href={`tel:${clientPhone}`} style={phoneLink}>{clientPhone}</Link>
              </Text>
              {clientEmail && (
                <Text style={detailRow}>
                  <span style={detailLabel}>Email:</span>
                  <span style={detailValue}>{clientEmail}</span>
                </Text>
              )}
            </Section>

            {/* Appointment Details */}
            <Section style={detailsBox}>
              <Text style={sectionTitle}>Detalles de la Cita</Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Fecha:</span>
                <span style={detailValue}>{appointmentDate}</span>
              </Text>
              <Text style={detailRow}>
                <span style={detailLabel}>Hora:</span>
                <span style={detailValue}>{appointmentTime}</span>
              </Text>
            </Section>

            {/* Client Notes */}
            {clientNotes && (
              <Section style={notesBox}>
                <Text style={sectionTitle}>Notas del Cliente</Text>
                <Text style={notesText}>{clientNotes}</Text>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Link href={adminUrl} style={button}>
                Ver en Panel Admin
              </Link>
            </Section>

            <Hr style={hr} />

            <Text style={smallText}>
              Este email fue enviado automaticamente desde el sistema de reservas.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Esthetic For Live - Panel de Administracion
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f3f4f6',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '560px',
}

const header = {
  backgroundColor: '#1a1a2e',
  padding: '24px 40px',
  borderRadius: '16px 16px 0 0',
}

const logo = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
}

const content = {
  backgroundColor: '#ffffff',
  padding: '40px',
}

const alertBadge = {
  backgroundColor: '#E91E63',
  borderRadius: '20px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '11px',
  fontWeight: '700',
  letterSpacing: '1px',
  padding: '6px 16px',
  margin: '0 0 16px',
}

const h1 = {
  color: '#1a1a2e',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 24px',
}

const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 16px',
}

const notesBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '12px',
  padding: '20px',
  margin: '0 0 16px',
  borderLeft: '4px solid #f59e0b',
}

const sectionTitle = {
  color: '#6b7280',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.5px',
  margin: '0 0 12px',
  textTransform: 'uppercase' as const,
}

const detailRow = {
  margin: '0 0 8px',
  fontSize: '15px',
  color: '#1a1a2e',
}

const detailLabel = {
  color: '#6b7280',
  display: 'inline-block',
  width: '100px',
}

const detailValue = {
  fontWeight: '600',
}

const phoneLink = {
  color: '#E91E63',
  fontWeight: '600',
  textDecoration: 'none',
}

const notesText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
  fontStyle: 'italic' as const,
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#E91E63',
  borderRadius: '12px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '15px',
  fontWeight: '600',
  padding: '12px 28px',
  textDecoration: 'none',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const smallText = {
  color: '#9ca3af',
  fontSize: '13px',
  margin: '0',
  textAlign: 'center' as const,
}

const footer = {
  backgroundColor: '#f3f4f6',
  padding: '20px 40px',
  borderRadius: '0 0 16px 16px',
}

const footerText = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
  textAlign: 'center' as const,
}

export default AdminNotificationEmail
