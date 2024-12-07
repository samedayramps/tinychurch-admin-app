'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { GroupWithMembers, GroupSettings as GroupSettingsType } from '@/lib/dal/repositories/group'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState } from 'react'

const groupSettingsSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  visibility: z.enum(['public', 'private', 'hidden']),
  max_members: z.number().min(0),
  allow_join_requests: z.boolean(),
  require_approval: z.boolean(),
  settings: z.record(z.unknown()).optional()
})

type FormData = z.infer<typeof groupSettingsSchema>

interface GroupSettingsTabProps {
  group: GroupWithMembers
  organizationId: string
}

export default function GroupSettingsTab({ group, organizationId }: GroupSettingsTabProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(groupSettingsSchema),
    defaultValues: {
      name: group.name,
      description: group.description || '',
      visibility: group.visibility,
      max_members: group.max_members || 0,
      allow_join_requests: (group.settings as GroupSettingsType)?.allow_join_requests ?? true,
      require_approval: (group.settings as GroupSettingsType)?.require_approval ?? true,
      settings: (group.settings as Record<string, unknown>) || {}
    }
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // Merge the boolean flags into the settings object
      const updatedSettings = {
        ...data.settings,
        allow_join_requests: data.allow_join_requests,
        require_approval: data.require_approval
      }
      
      // Prepare the update payload
      const updateData = {
        name: data.name,
        description: data.description,
        visibility: data.visibility,
        max_members: data.max_members,
        settings: updatedSettings
      }

      // TODO: Call your update API here
      // await updateGroupSettings(group.id, updateData)

      toast({
        title: 'Success',
        description: 'Group settings updated successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update settings',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Group Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormDescription>
                      Briefly describe the purpose and activities of this group.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="hidden">Hidden</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Members</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      Set to 0 for no limit
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allow_join_requests"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow Join Requests</FormLabel>
                      <FormDescription>
                        Allow users to request to join this group
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
                control={form.control}
                name="require_approval"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Approval</FormLabel>
                      <FormDescription>
                        Leaders must approve join requests
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

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}