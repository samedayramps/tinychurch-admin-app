'use client'

import { useWizard } from '../wizard-context'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

interface SettingsStepProps {
  organizations: { id: string; name: string }[]
}

export function SettingsStep({ organizations }: SettingsStepProps) {
  const { form: { control, watch } } = useWizard()
  const requiresRegistration = watch('requires_registration')

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="is_public"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Public Event</FormLabel>
              <FormDescription>
                Make this event visible to non-members
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="show_on_website"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Show on Website</FormLabel>
              <FormDescription>
                Display this event on the public website calendar
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="requires_registration"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Require Registration</FormLabel>
              <FormDescription>
                Attendees must register to attend this event
              </FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {requiresRegistration && (
        <FormField
          control={control}
          name="max_participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Participants</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Leave blank for unlimited"
                  value={field.value || ''}
                  onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Set a limit on the number of participants (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
} 