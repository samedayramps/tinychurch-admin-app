'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/utils/supabase/client'
import { toast } from '@/components/hooks/use-toast'
import type { Profile } from '@/lib/types/auth'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { schemas } from '@/lib/validations/schemas'

interface UserFormProps {
  user: Profile
  organizations: Array<{ id: string; name: string }>
}

export function UserForm({ user, organizations }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof schemas.userForm>>({
    resolver: zodResolver(schemas.userForm),
    defaultValues: {
      first_name: user.first_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      alternative_email: user.alternative_email ?? '',
      phone: user.phone ?? '',
      is_active: user.is_active ?? true,
      is_superadmin: user.is_superadmin ?? false,
      status: user.status ?? 'active',
      notification_preferences: user.notification_preferences ?? {
        email: true,
        sms: false,
        push: false
      },
      organization_id: user.organization_members?.[0]?.organizations.id ?? '',
      role: user.organization_members?.[0]?.role ?? 'member'
    },
  })

  async function onSubmit(values: z.infer<typeof schemas.userForm>) {
    setIsLoading(true)
    try {
      // Update profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          alternative_email: values.alternative_email || null,
          phone: values.phone || null,
          is_active: values.is_active,
          is_superadmin: values.is_superadmin,
          status: values.status,
          notification_preferences: values.notification_preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw new Error(profileError.message)
      }

      // If organization_id is 'none' or empty, remove from all organizations
      if (!values.organization_id || values.organization_id === 'none') {
        const { error: deleteError } = await supabase
          .from('organization_members')
          .delete()
          .eq('user_id', user.id)

        if (deleteError) {
          console.error('Organization removal error:', deleteError)
          throw new Error(deleteError.message)
        }
      } else {
        // Check if user is already in the organization
        const { data: existingMembership, error: membershipCheckError } = await supabase
          .from('organization_members')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (membershipCheckError && membershipCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Membership check error:', membershipCheckError)
          throw new Error(membershipCheckError.message)
        }

        if (existingMembership) {
          // Update existing membership
          const { error: updateError } = await supabase
            .from('organization_members')
            .update({
              organization_id: values.organization_id,
              role: values.role,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingMembership.id)

          if (updateError) {
            console.error('Membership update error:', updateError)
            throw new Error(updateError.message)
          }
        } else {
          // Create new membership
          const { error: insertError } = await supabase
            .from('organization_members')
            .insert({
              user_id: user.id,
              organization_id: values.organization_id,
              role: values.role,
              joined_date: new Date().toISOString()
            })

          if (insertError) {
            console.error('Membership insert error:', insertError)
            throw new Error(insertError.message)
          }
        }
      }

      toast({
        title: 'Success',
        description: 'User updated successfully',
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred while updating user',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alternative_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternative Email</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} />
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
                defaultValue={field.value ?? undefined}
                value={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="visitor">Visitor</SelectItem>
                  <SelectItem value="ministry_leader">Ministry Leader</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <FormDescription>
                    Allow user to access the system
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_superadmin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Superadmin</FormLabel>
                  <FormDescription>
                    Grant full system access
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Form>
  )
} 