'use client'

import { useState, useEffect } from 'react'
import { useWizard } from '../wizard-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { AddressField } from '@/components/ui/form/address-field'
import type { Organization } from '../types'

interface EventDetailsStepProps {
  organizations: Organization[]
}

export function EventDetailsStep({ organizations }: EventDetailsStepProps) {
  const { form: { control, watch, setValue } } = useWizard()
  const [selectedOrg, setSelectedOrg] = useState<Organization | undefined>()
  const [useDifferentAddress, setUseDifferentAddress] = useState(false)
  
  const organizationId = watch('organization_id')
  const useDifferentAddressValue = watch('use_different_address')

  useEffect(() => {
    const org = organizations.find(o => o.id === organizationId)
    setSelectedOrg(org)
    
    // When organization changes and not using different address,
    // update the location with organization's address
    if (org && !useDifferentAddressValue) {
      setValue('location.address', {
        street: org.address?.street || '',
        city: org.address?.city || '',
        state: org.address?.state || '',
        postal_code: org.address?.postal_code || '',
        country: org.address?.country || 'US',
      })
    }
  }, [organizationId, organizations, useDifferentAddressValue, setValue])

  useEffect(() => {
    setUseDifferentAddress(!!useDifferentAddressValue)
  }, [useDifferentAddressValue])

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                value={field.value || ''} 
                placeholder="Event description" 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="organization_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Organization</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value)
                // Reset use_different_address when organization changes
                setValue('use_different_address', false)
              }} 
              value={field.value || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedOrg && (
        <FormField
          control={control}
          name="use_different_address"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Use different address than organization
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      )}

      {selectedOrg && !useDifferentAddress ? (
        <AddressField
          name="location.address"
          control={control}
          value={selectedOrg.address}
          readOnly
        />
      ) : (
        <FormField
          control={control}
          name="location.address"
          render={({ field }) => (
            <AddressField
              name="location.address"
              control={control}
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      )}
    </div>
  )
} 