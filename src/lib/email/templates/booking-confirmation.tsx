import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface BookingConfirmationEmailProps {
  clientName: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  staffName?: string
  whatsappLink: string
}

export function BookingConfirmationEmail({
  clientName,
  serviceName,
  appointmentDate,
  appointmentTime,
  staffName,
  whatsappLink,
}: BookingConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu cita en Esthetic For Live ha sido confirmada</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Esthetic For Live</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Cita Confirmada</Heading>

            <Text style={paragraph}>
              Hola <strong>{clientName}</strong>,
            </Text>

            <Text style={paragraph}>
              Tu cita ha sido reservada exitosamente. Aqui estan los detalles:
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

            <Text style={paragraph}>
              Si necesitas modificar o cancelar tu cita, contactanos por WhatsApp:
            </Text>

            <Section style={buttonContainer}>
              <Link href={whatsappLink} style={button}>
                Contactar por WhatsApp
              </Link>
            </Section>

            <Hr style={hr} />

            <Text style={smallText}>
              Recuerda llegar 10 minutos antes de tu cita.
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
            <Text style={footerLinks}>
              <Link href="https://instagram.com/estheticforlivee" style={footerLink}>
                Instagram
              </Link>
              {' | '}
              <Link href="https://estheticforlive.vercel.app" style={footerLink}>
                Sitio Web
              </Link>
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
}

const logo = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0',
  textAlign: 'center' as const,
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
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
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

const footerLinks = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '16px 0 0',
  textAlign: 'center' as const,
}

const footerLink = {
  color: '#E91E63',
  textDecoration: 'none',
}

export default BookingConfirmationEmail
