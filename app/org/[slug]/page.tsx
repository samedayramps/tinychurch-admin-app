import { headers } from 'next/headers'

export default async function OrganizationPage() {
  const headersList = headers()
  const orgRole = headersList.get('x-organization-role')
  const orgSlug = headersList.get('x-organization-slug')
  
  // Use orgRole and orgSlug to customize the page...
} 