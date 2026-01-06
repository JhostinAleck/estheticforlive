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

interface StaffInvitationEmailProps {
  staffName: string
  invitationLink: string
}

export function StaffInvitationEmail({
  staffName,
  invitationLink,
}: StaffInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Has sido invitado a unirte al equipo de Esthetic For Live</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={logo}>Esthetic For Live</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h1}>Bienvenido al Equipo</Heading>

            <Text style={paragraph}>
              Hola <strong>{staffName}</strong>,
            </Text>

            <Text style={paragraph}>
              Has sido invitado/a a unirte al portal de colaboradores de Esthetic For Live.
              Desde el portal podras:
            </Text>

            {/* Features Box */}
            <Section style={featuresBox}>
              <Text style={featureItem}>
                Ver y gestionar tus citas
              </Text>
              <Text style={featureItem}>
                Administrar tu disponibilidad
              </Text>
              <Text style={featureItem}>
                Bloquear horarios para reuniones o descansos
              </Text>
              <Text style={featureItem}>
                Registrar tus dias libres y vacaciones
              </Text>
            </Section>

            <Text style={paragraph}>
              Para activar tu cuenta, haz clic en el siguiente boton y configura tu contrasena:
            </Text>

            <Section style={buttonContainer}>
              <Link href={invitationLink} style={button}>
                Aceptar Invitacion
              </Link>
            </Section>

            <Hr style={hr} />

            <Text style={smallText}>
              Este enlace es valido por 7 dias. Si no solicitaste esta invitacion,
              puedes ignorar este correo de forma segura.
            </Text>

            <Text style={smallText}>
              Si tienes problemas con el boton, copia y pega este enlace en tu navegador:
            </Text>

            <Text style={linkText}>
              {invitationLink}
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

const featuresBox = {
  backgroundColor: '#FEF7F8',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '24px 0',
}

const featureItem = {
  color: '#1a1a2e',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 8px',
  paddingLeft: '20px',
  position: 'relative' as const,
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
  margin: '0 0 12px',
  textAlign: 'center' as const,
}

const linkText = {
  color: '#E91E63',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0',
  textAlign: 'center' as const,
  wordBreak: 'break-all' as const,
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

export default StaffInvitationEmail
