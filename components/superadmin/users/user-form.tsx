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
import { createClient } from '@/utils/supabase/client'
import { toast } from '@/components/hooks/use-toast'
import type { Profile } from '@/lib/types/auth'

const formSchema = z.object({
  full_name: z.string().min(2).max(100),
  email: z.string().email(),
  is_superadmin: z.boolean().default(false),
})

interface UserFormProps {
  user: Profile
  organizations: Array<{ id: string; name: string }>
}

export function UserForm({ user, organizations }: UserFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: user.full_name || '',
      email: user.email,
      is_superadmin: user.is_superadmin || false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update(values)
        .eq('id', user.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'User updated successfully',
      })
      
      router.refresh()
    } catch (error) {
      console.error('Error updating user:', error)
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_superadmin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Superadmin</FormLabel>
                <FormDescription>
                  Grant full administrative access
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </Form>
  )
} 