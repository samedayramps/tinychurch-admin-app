'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Profile } from '@/lib/types/auth'
import { AvatarUpload } from '@/components/avatar-upload'
import { updateProfile } from '@/lib/actions/profile'
import { schemas } from '@/lib/validations/schemas'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const form = useForm<z.infer<typeof schemas.profileForm>>({
    resolver: zodResolver(schemas.profileForm),
    defaultValues: {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      email: profile.email || "",
      alternative_email: profile.alternative_email || "",
      phone: profile.phone || "",
      notification_preferences: profile.notification_preferences || {
        email: true,
        sms: false,
        push: false,
      },
    },
  })

  async function onSubmit(data: z.infer<typeof schemas.profileForm>) {
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'notification_preferences') {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value?.toString() || '')
        }
      })

      const result = await updateProfile(formData)
      
      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <AvatarUpload
          uid={profile.id}
          url={profile.avatar_url || null}
          onUpload={async (url) => {
            try {
              const formData = new FormData()
              formData.append('avatar_url', url)
              const result = await updateProfile(formData)
              
              if (result.error) {
                console.error('Profile update error:', result.error)
                toast({
                  title: "Error",
                  description: result.error,
                  variant: "destructive",
                })
                return
              }

              toast({
                title: "Success",
                description: "Avatar updated successfully",
              })
            } catch (error) {
              console.error('Avatar update error:', error)
              toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update avatar",
                variant: "destructive",
              })
            }
          }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            name="alternative_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternative Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  Optional secondary email address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  )
} 