'use server'

import { TenantOnboardingService } from '@/lib/services/tenant-onboarding'
import { requireSuperAdmin } from '@/lib/auth/permissions'
import { sendEmail } from '@/lib/utils/email'

export async function onboardNewTenantAction(formData: FormData) {
  try {
    // Verify superadmin status
    const superadmin = await requireSuperAdmin()
    
    // Parse and validate form data
    const tenantData = {
      organization: {
        name: formData.get('orgName') as string,
        slug: formData.get('orgSlug') as string,
        settings: JSON.parse(formData.get('settings') as string || '{}'),
        limits: JSON.parse(formData.get('limits') as string || '{}')
      },
      admin: {
        email: formData.get('adminEmail') as string,
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
        phone: formData.get('phone') as string
      }
    }

    // Create onboarding service and process
    const onboardingService = await TenantOnboardingService.create()
    const result = await onboardingService.onboardNewTenant(tenantData, superadmin.id)

    // Send welcome email to admin with temporary password
    await sendEmail({
      to: result.adminUser.email,
      subject: `Welcome to ${tenantData.organization.name}`,
      html: `
        <p>Welcome to ${tenantData.organization.name}!</p>
        <p>You will receive a separate email with your invitation link to set up your account.</p>
        <p>Once you receive it, please click the link to complete your account setup.</p>
        <p>If you don't receive the invitation email within a few minutes, please check your spam folder.</p>
        <p>Login URL: ${process.env.NEXT_PUBLIC_SITE_URL}/sign-in</p>
      `
    })

    return { success: true, data: result }
  } catch (error) {
    console.error('Tenant onboarding error:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to onboard tenant'
    }
  }
} 