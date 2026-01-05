import { Resend } from 'resend'

let resendClient: Resend | null = null

export function getResend(): Resend {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured')
    }
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

export const EMAIL_FROM = 'Esthetic For Live <onboarding@resend.dev>'
export const ADMIN_EMAIL = 'estheticforlive06@gmail.com'
