// components/groups/group-form.tsx
'use client'

import { useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/hooks/use-toast'
import { useRouter } from 'next/navigation'
import type { Database, Json } from '@/database.types'

type GroupType = Database['public']['Enums']['group_type']
type GroupVisibility = Database['public']['Enums']['group_visibility']

// Form validation schema
const groupFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Group name must be at least 2 characters.',
  }),
  description: z.string().nullable(),
  type: z.enum(['ministry', 'small_group', 'committee', 'service_team', 'other'] as const),
  visibility: z.enum(['public', 'private', 'hidden'] as const),
  max_members: z.number().min(0).nullable(),
  settings: z.record(z.unknown()).nullable()
})

type FormData = z.infer<typeof groupFormSchema>

interface GroupFormProps {
  organizationId: string
  initialData?: Partial<Database['public']['Tables']['groups']['Row']>
  onSubmit: (data: FormData) => Promise<{ success: boolean } | void>
  redirectPath?: string
}

interface GroupFormData {
  name: string
  description?: string | null
  type: Database['public']['Enums']['group_type']
  visibility: Database['public']['Enums']['group_visibility']
  max_members?: number | null
  settings?: Json | null  // Added to match schema
}

export function GroupForm({ 
  organizationId, 
  initialData, 
  onSubmit,
  redirectPath
}: GroupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize form with default values or initial data
  const form = useForm<FormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      type: (initialData?.type as GroupType) || 'small_group',
      visibility: (initialData?.visibility as GroupVisibility) || 'public',
      max_members: initialData?.max_members || 0,
      settings: typeof initialData?.settings === 'object' ? initialData.settings as Record<string, unknown> : null
    }
  })

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await onSubmit(data)
      
      toast({
        title: "Success",
        description: initialData ? "Group updated successfully" : "Group created successfully",
      })
      
      // Handle redirect client-side
      if (redirectPath) {
        router.push(redirectPath)
      } else {
        router.push(`/org/${organizationId}/groups`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message.includes('already exists') 
            ? error.message 
            : "Failed to create group"
          : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Group Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Youth Ministry" {...field} />
              </FormControl>
              <FormDescription>
                The name of your group as it will appear to members.
              </FormDescription>
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
                  placeholder="Describe the purpose of this group"
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                A brief description of what this group does and who it's for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ministry">Ministry Team</SelectItem>
                    <SelectItem value="small_group">Small Group</SelectItem>
                    <SelectItem value="committee">Committee</SelectItem>
                    <SelectItem value="service_team">Service Team</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The type of group helps organize and categorize your groups.
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
                    <SelectItem value="public">
                      Public - Anyone can see and request to join
                    </SelectItem>
                    <SelectItem value="private">
                      Private - Only visible to members and invitees
                    </SelectItem>
                    <SelectItem value="hidden">
                      Hidden - Only visible to leaders and admins
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Controls who can see and join this group.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="max_members"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Members (Optional)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field}
                  value={field.value ?? ''}
                  onChange={event => field.onChange(event.target.valueAsNumber || null)}
                />
              </FormControl>
              <FormDescription>
                Leave at 0 for no member limit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/org/${organizationId}/groups`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : initialData ? "Update Group" : "Create Group"}
          </Button>
        </div>
      </form>
    </Form>
  )
}