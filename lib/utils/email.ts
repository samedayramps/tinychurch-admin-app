import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TinyChurch <noreply@tinychurch.app>',
      to,
      subject,
      html,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to send email:', error)
    throw error
  }
}

export function getGroupInvitationEmailContent(params: {
  invitedByName: string
  groupName: string
  organizationName: string
  acceptUrl: string
}) {
  const { invitedByName, groupName, organizationName, acceptUrl } = params
  
  return `
    <div>
      <h2>You've been invited to join a group!</h2>
      <p>${invitedByName} has invited you to join the ${groupName} group at ${organizationName}.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${acceptUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Accept Invitation
      </a>
      <p>This invitation will expire in 7 days.</p>
    </div>
  `
}

export function getOrganizationInvitationEmailContent(params: {
  invitedByName: string
  organizationName: string
  setupUrl: string
}) {
  const { invitedByName, organizationName, setupUrl } = params
  
  return `
    <div>
      <h2>You've been invited to join an organization!</h2>
      <p>${invitedByName} has invited you to join ${organizationName}.</p>
      <p>Click the link below to set up your account:</p>
      <a href="${setupUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        Set Up Account
      </a>
      <p>This invitation will expire in 7 days.</p>
    </div>
  `
} 