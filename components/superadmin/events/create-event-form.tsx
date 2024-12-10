'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { TimePicker } from '@/components/ui/time-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { createClient } from '@/lib/utils/supabase/client'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { AddressField } from "@/components/ui/form/address-field"
import { AddressSection } from './address-section'

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  location: z.object({
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    }).optional().default({}),
    specific_location: z.string().optional(),
  }).default({
    address: {},
    specific_location: '',
  }),
  start_date: z.date(),
  end_date: z.date().optional(),
  start_time: z.string(),
  end_time: z.string(),
  organization_id: z.string().optional(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']),
  recurring_days: z.array(z.number()).default([]),
  recurring_until: z.date().optional(),
  timezone: z.string(),
  participant_type: z.enum(['all', 'groups', 'individuals']),
  participant_groups: z.array(z.string()).default([]),
  participant_users: z.array(z.string()).default([]),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
})

interface Organization {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
  organization_id: string
}

interface User {
  id: string
  full_name: string
  email: string
}

interface OrganizationMember {
  user_id: string;
  profiles: {
    id: string;
    email: string;
    full_name: string | null;
  }
}

interface CreateEventFormProps {
  organizations: Organization[]
  onSuccess?: () => void
}

export function CreateEventForm({ organizations, onSuccess }: CreateEventFormProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const methods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: {
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'US',
        },
        specific_location: '',
      },
      start_date: new Date(),
      end_date: undefined,
      start_time: '09:00',
      end_time: '10:00',
      organization_id: '',
      frequency: 'once',
      recurring_days: [],
      recurring_until: undefined,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      participant_type: 'all',
      participant_groups: [],
      participant_users: [],
      status: 'scheduled',
    },
  })

  console.log('Form Control:', methods.control)

  const frequency = methods.watch('frequency')
  const organizationId = methods.watch('organization_id')
  const participantType = methods.watch('participant_type')

  // Fetch groups and users when organization is selected
  const fetchParticipants = async (orgId: string) => {
    try {
      // Fetch groups for the selected organization
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          organization_id
        `)
        .eq('organization_id', orgId)
        .is('deleted_at', null)
        .order('name')

      if (groupsError) throw groupsError
      setGroups(groupsData || [])

      // Fetch users (organization members) for the selected organization
      const { data: usersData, error: usersError } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          profiles!inner (
            id,
            email,
            full_name
          )
        `)
        .eq('organization_id', orgId)
        .is('deleted_at', null)

      if (usersError) throw usersError
      
      // Transform the data with proper type assertions
      const transformedUsers = (usersData as any)?.map((member: { 
        user_id: string; 
        profiles: { 
          id: string; 
          email: string; 
          full_name: string | null;
        }
      }) => ({
        id: member.profiles.id,
        full_name: member.profiles.full_name || member.profiles.email,
        email: member.profiles.email
      })) || []
      
      setUsers(transformedUsers)
    } catch (error) {
      console.error('Error fetching participants:', error)
      setGroups([])
      setUsers([])
    }
  }

  // Watch for organization changes and fetch participants
  useEffect(() => {
    if (organizationId) {
      fetchParticipants(organizationId)
    } else {
      setGroups([])
      setUsers([])
    }
  }, [organizationId])

  // Reset participant selections when type changes
  useEffect(() => {
    methods.setValue('participant_groups', [])
    methods.setValue('participant_users', [])
  }, [participantType, methods])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)

    try {
      // Format the data for submission
      const eventData = {
        title: values.title,
        description: values.description,
        location: values.location,
        start_date: format(values.start_date, 'yyyy-MM-dd'),
        end_date: values.end_date ? format(values.end_date, 'yyyy-MM-dd') : null,
        start_time: values.start_time,
        end_time: values.end_time,
        organization_id: values.organization_id,
        frequency: values.frequency,
        recurring_days: values.recurring_days,
        recurring_until: values.recurring_until ? format(values.recurring_until, 'yyyy-MM-dd') : null,
        timezone: values.timezone,
        participant_type: values.participant_type,
        participant_groups: values.participant_type === 'groups' ? values.participant_groups : [],
        participant_users: values.participant_type === 'individuals' ? values.participant_users : [],
        status: values.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('calendar_events')
        .insert([eventData])

      if (error) throw error
      
      onSuccess?.()
      methods.reset()
    } catch (error) {
      console.error('Error creating event:', error)
      throw error // Re-throw to be caught by the form's error handling
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Event Details */}
        <FormField
          control={methods.control}
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

        {/* Organization Selection */}
        <FormField
          control={methods.control}
          name="organization_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value)
                  fetchParticipants(value)
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                </FormControl>
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

        {/* Participant Selection */}
        {organizationId && (
          <FormField
            control={methods.control}
            name="participant_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event For</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="all" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Entire Organization
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="groups" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Specific Groups
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="individuals" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Specific Individuals
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Group Selection */}
        {participantType === 'groups' && (
          <FormField
            control={methods.control}
            name="participant_groups"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Groups</FormLabel>
                <FormControl>
                  <div className="border rounded-md">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center space-x-2 p-2 hover:bg-accent"
                      >
                        <Checkbox
                          checked={field.value?.includes(group.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || []
                            const updated = checked
                              ? [...current, group.id]
                              : current.filter(id => id !== group.id)
                            field.onChange(updated)
                          }}
                        />
                        <span>{group.name}</span>
                      </div>
                    ))}
                    {groups.length === 0 && (
                      <p className="p-2 text-muted-foreground">No groups found</p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Individual Selection */}
        {participantType === 'individuals' && (
          <FormField
            control={methods.control}
            name="participant_users"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Individuals</FormLabel>
                <FormControl>
                  <div className="border rounded-md max-h-[200px] overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 p-2 hover:bg-accent"
                      >
                        <Checkbox
                          checked={field.value?.includes(user.id)}
                          onCheckedChange={(checked) => {
                            const current = field.value || []
                            const updated = checked
                              ? [...current, user.id]
                              : current.filter(id => id !== user.id)
                            field.onChange(updated)
                          }}
                        />
                        <div className="flex flex-col">
                          <span>{user.full_name}</span>
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <p className="p-2 text-muted-foreground">No users found</p>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Rest of the form fields (dates, times, etc.) */}
        {/* ... existing form fields ... */}

        <AddressSection />

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
} 