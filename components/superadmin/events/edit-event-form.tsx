'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import type { Database } from '@/database.types'
import { CalendarEvent, LocationJson, isLocationJson } from './shared-types'
import { AddressField } from '@/components/ui/form/address-field'

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().nullable(),
  location: z.object({
    address: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    }),
    specific_location: z.string().optional(),
  }),
  start_date: z.date(),
  end_date: z.date().optional(),
  start_time: z.string(),
  end_time: z.string(),
  organization_id: z.string().optional(),
  frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'yearly']),
  recurring_days: z.array(z.number()).optional(),
  recurring_until: z.date().optional(),
  timezone: z.string(),
})

interface EditEventFormProps {
  event?: CalendarEvent
  organizations: { id: string; name: string }[]
  onSuccess: (updatedEvent: CalendarEvent) => void
  onCancel: () => void
}

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
]

export function EditEventForm({ 
  event, 
  organizations,
  onSuccess,
  onCancel 
}: EditEventFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || null,
      location: event?.location && isLocationJson(event.location) ? {
        address: {
          street: event.location.address.street || '',
          city: event.location.address.city || undefined,
          state: event.location.address.state || undefined,
          postal_code: event.location.address.postal_code || undefined,
          country: event.location.address.country || 'US',
        },
        specific_location: event.location.specific_location || undefined,
      } : {
        address: {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'US',
        },
        specific_location: '',
      },
      start_date: event ? new Date(event.start_date) : new Date(),
      end_date: event?.end_date ? new Date(event.end_date) : undefined,
      start_time: event?.start_time || '09:00',
      end_time: event?.end_time || '10:00',
      organization_id: event?.organization_id || undefined,
      frequency: event?.frequency || 'once',
      recurring_days: event?.recurring_days || [],
      recurring_until: event?.recurring_until ? new Date(event.recurring_until) : undefined,
      timezone: event?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  })

  const frequency = form.watch('frequency')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch('/api/events' + (event ? `/${event.id}` : ''), {
        method: event ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) throw new Error('Failed to save event')
      
      const updatedEvent = await response.json()
      onSuccess(updatedEvent)
    } catch (error) {
      console.error('Failed to save event:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Same as start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < form.getValues('start_date')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    minTime={form.getValues('start_time')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <AddressField
                  name="location.address"
                  control={form.control}
                  value={field.value.address}
                  onChange={(address) => {
                    field.onChange({
                      ...field.value,
                      address
                    })
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organization_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select 
                onValueChange={field.onChange} 
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

        <FormField
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frequency</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="once">One-time event</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {frequency === 'weekly' && (
          <FormField
            control={form.control}
            name="recurring_days"
            render={() => (
              <FormItem>
                <FormLabel>Repeats On</FormLabel>
                <div className="grid grid-cols-4 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <FormField
                      key={day.value}
                      control={form.control}
                      name="recurring_days"
                      render={({ field }) => (
                        <FormItem
                          key={day.value}
                          className="flex flex-row items-center space-x-2"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(day.value)}
                              onCheckedChange={(checked) => {
                                const current = field.value || []
                                const updated = checked
                                  ? [...current, day.value]
                                  : current.filter((value) => value !== day.value)
                                field.onChange(updated)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            {day.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {frequency !== 'once' && (
          <FormField
            control={form.control}
            name="recurring_until"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Repeat Until</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick an end date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < form.getValues('start_date')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {event ? 'Update' : 'Create'} Event
          </Button>
        </div>
      </form>
    </Form>
  )
} 