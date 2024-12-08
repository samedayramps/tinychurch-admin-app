'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { formatPhoneNumber } from '@/lib/utils/format'
import { useRouter } from 'next/navigation'
import type { Database } from '@/database.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TimezoneField } from "@/components/ui/form/timezone-field"
import { TIMEZONE_OPTIONS } from "@/components/ui/form/timezone-field"
import { AddressField } from "@/components/ui/form/address-field"
import { useToast } from '@/components/hooks/use-toast'

type Organization = Database['public']['Tables']['organizations']['Insert']
type Profile = Database['public']['Tables']['profiles']['Insert']

const onboardingSchema = z.object({
  organization: z.object({
    name: z.string().min(2).max(100),
    slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/),
    website_url: z.union([
      z.string().url(),
      z.string().length(0),
      z.null()
    ]).optional(),
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
    timezone: z.string()
      .min(1, 'Please select a timezone')
      .refine(
        (val: string) => TIMEZONE_OPTIONS.some((tz) => tz.value === val),
        'Invalid timezone selection'
      ),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().default('US'),
    }).optional(),
    settings: z.object({
      features_enabled: z.array(z.string()).default([]),
      theme: z.string().default('light'),
      branding: z.object({
        logo_url: z.string().optional(),
        primary_color: z.string().optional(),
      }).optional(),
      email_templates: z.record(z.unknown()).optional(),
    }).default({}),
    limits: z.object({
      max_users: z.number().default(5),
      max_storage_gb: z.number().default(10),
    }).default({ max_users: 5, max_storage_gb: 10 }),
  }),
  admin: z.object({
    email: z.string().email(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    phone: z.string().optional(),
    notification_preferences: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      push: z.boolean().default(true),
    }).default({}),
  }),
})

type OnboardingFormValues = z.infer<typeof onboardingSchema>

interface TenantOnboardingFormProps {
  existingOrganizations: Database['public']['Tables']['organizations']['Row'][]
}

const steps = [
  {
    title: 'Organization Details',
    description: 'Basic information about your organization',
    fields: [
      'organization.name',
      'organization.slug',
      'organization.website_url',
      'organization.timezone',
      'organization.address'
    ]
  },
  {
    title: 'Admin User',
    description: 'Set up the organization administrator',
    fields: [
      'admin.first_name',
      'admin.last_name',
      'admin.email',
      'admin.phone'
    ]
  }
]

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 50) // Enforce max length of 50
}

export function TenantOnboardingForm({ existingOrganizations }: TenantOnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      organization: {
        status: 'active',
        timezone: TIMEZONE_OPTIONS[0].value
      }
    }
  })

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'organization.name') {
        const nameValue = value.organization?.name
        if (nameValue) {
          const slug = generateSlug(nameValue)
          form.setValue('organization.slug', slug, { 
            shouldValidate: true,
            shouldDirty: true 
          })
        }
      }
    })
    
    return () => subscription.unsubscribe()
  }, [form])

  const progress = ((currentStep + 1) / steps.length) * 100

  async function onSubmit(data: z.infer<typeof onboardingSchema>) {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch('/api/superadmin/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create organization')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Organization created successfully",
      })
      
      router.push('/superadmin/organizations')
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create organization'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    const currentFields = steps[currentStep].fields
    const result = await form.trigger(currentFields as any[])
    
    if (!result) {
      return
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      form.handleSubmit(onSubmit)()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault()
        handleNext()
      }} className="space-y-6">
        <Progress value={progress} className="h-2" />
        
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentStep === 0 && (
              <>
                <FormField
                  control={form.control}
                  name="organization.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization.slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Slug</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} readOnly />
                      </FormControl>
                      <FormDescription>
                        Automatically generated from organization name. Used in URLs and must be unique.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization.website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL (Optional)</FormLabel>
                      <FormControl>
                        <Input type="url" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <AddressField
                  control={form.control}
                  name="organization.address"
                  label="Organization Address"
                  description="Primary business address"
                />
                <TimezoneField 
                  control={form.control}
                  name="organization.timezone"
                />
              </>
            )}

            {currentStep === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="admin.first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin.last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admin.phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="123-456-7890"
                          onChange={e => field.onChange(formatPhoneNumber(e.target.value))}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : currentStep === steps.length - 1 ? (
                'Create Organization'
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
} 