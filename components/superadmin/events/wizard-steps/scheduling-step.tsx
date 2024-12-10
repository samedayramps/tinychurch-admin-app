'use client'

import { useWizard } from '../wizard-context'
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form'
import { DatePicker } from '@/components/ui/date-picker'
import { TimePicker } from '@/components/ui/time-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
]

export function SchedulingStep() {
  const { form: { control, watch } } = useWizard()
  const frequency = watch('frequency')
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value || undefined}
                  onSelect={(date) => field.onChange(date || null)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value || undefined}
                  onSelect={(date) => field.onChange(date || null)}
                  minDate={watch('start_date') || undefined}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
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
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="end_time"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time</FormLabel>
              <FormControl>
                <TimePicker
                  value={field.value}
                  onChange={field.onChange}
                  minTime={watch('start_time')}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="frequency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Repeat</FormLabel>
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
                <SelectItem value="once">Does not repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      {frequency === 'weekly' && (
        <FormField
          control={control}
          name="recurring_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Repeats On</FormLabel>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <FormItem
                    key={day.value}
                    className="flex flex-col items-center space-y-2"
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
                    <FormLabel className="text-xs font-normal">
                      {day.label.slice(0, 3)}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
            </FormItem>
          )}
        />
      )}

      {frequency !== 'once' && (
        <>
          <FormField
            control={control}
            name="recurring_indefinitely"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Repeat indefinitely</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {!watch('recurring_indefinitely') && (
            <FormField
              control={control}
              name="recurring_until"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Until</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value || undefined}
                      onSelect={(date) => field.onChange(date || null)}
                      minDate={watch('start_date') || undefined}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </>
      )}
    </div>
  )
} 