'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PencilIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/lib/hooks/use-toast'
import type { OrganizationWithStats } from '@/lib/dal/repositories/organization'
import type { AvailableFeature } from '@/lib/types/organization'
import { AVAILABLE_FEATURES } from '@/lib/types/organization'
import Link from 'next/link'

interface OrganizationProfileTabProps {
  organization: OrganizationWithStats
}

export function OrganizationProfileTab({ organization }: OrganizationProfileTabProps) {
  const { toast } = useToast()

  const handleError = (error: Error) => {
    toast({
      title: 'Error',
      description: error.message || 'An unexpected error occurred',
      variant: 'destructive',
    })
  }

  const getFeatures = (): AvailableFeature[] => {
    if (!organization.settings?.features_enabled) return []
    const features = Array.isArray(organization.settings.features_enabled)
      ? organization.settings.features_enabled
      : typeof organization.settings.features_enabled === 'string'
      ? JSON.parse(organization.settings.features_enabled)
      : []
    
    return features.filter((feature: string): feature is AvailableFeature => 
      AVAILABLE_FEATURES.includes(feature as AvailableFeature)
    )
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                View and manage organization details
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/superadmin/organizations/${organization.id}/edit`}>
                <PencilIcon className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-medium">Basic Information</h3>
              <dl className="mt-2 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Organization Name</dt>
                  <dd className="font-medium">{organization.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Slug</dt>
                  <dd className="font-medium">{organization.slug}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant={organization.status === 'active' ? 'success' : 'secondary'}>
                      {organization.status || 'Unknown'}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{organization.created_at ? formatDate(organization.created_at) : '—'}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="font-medium">Contact Details</h3>
              <dl className="mt-2 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd>{organization.contact_email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd>{organization.contact_phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Website</dt>
                  <dd>{organization.website_url || '—'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {organization.description && (
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">{organization.description}</p>
            </div>
          )}

          {organization.settings?.features_enabled && (
            <div>
              <h3 className="font-medium mb-2">Features Enabled</h3>
              <div className="flex flex-wrap gap-2">
                {getFeatures().map((feature) => (
                  <Badge key={feature} variant="outline">{feature}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.memberCount}</div>
          </CardContent>
        </Card>
        {/* Add more stat cards here as needed */}
      </div>
    </div>
  )
}