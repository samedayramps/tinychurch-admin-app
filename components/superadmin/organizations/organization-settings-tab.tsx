'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/lib/hooks/use-toast'
import { useState } from 'react'
import type { OrganizationWithStats } from '@/lib/dal/repositories/organization'
import type { AvailableFeature } from '@/lib/types/organization'
import { AVAILABLE_FEATURES } from '@/lib/types/organization'
import { updateOrganizationSettings } from '@/lib/actions/organization'

interface OrganizationSettingsTabProps {
  organization: OrganizationWithStats
}

export function OrganizationSettingsTab({ organization }: OrganizationSettingsTabProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  
  const getInitialFeatures = (): AvailableFeature[] => {
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
  
  const [features, setFeatures] = useState<AvailableFeature[]>(getInitialFeatures())

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData(event.currentTarget)
      formData.set('settings', JSON.stringify({ 
        ...organization.settings,
        features_enabled: features 
      }))
      
      await updateOrganizationSettings(formData)
      
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Configure your organization's basic settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={organization.name}
              placeholder="Enter organization name"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            Enable or disable features for your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {AVAILABLE_FEATURES.map((feature) => (
              <div key={feature} className="flex items-center space-x-2">
                <Checkbox
                  id={feature}
                  checked={features.includes(feature)}
                  onCheckedChange={(checked) => {
                    setFeatures(prev => 
                      checked 
                        ? [...prev, feature]
                        : prev.filter(f => f !== feature)
                    )
                  }}
                />
                <Label htmlFor={feature} className="capitalize">
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
} 