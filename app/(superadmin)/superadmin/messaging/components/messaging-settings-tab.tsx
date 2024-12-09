'use client'

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/hooks/use-toast"
import { updateMessagingSettings } from "@/lib/actions/messaging"
import { TimePicker } from '@/components/ui/time-picker'

const formSchema = z.object({
  default_from_name: z.string().min(2, {
    message: "From name must be at least 2 characters.",
  }),
  default_reply_to: z.string().email({
    message: "Please enter a valid email address.",
  }),
  notifications_enabled: z.boolean(),
  default_send_time: z.string().optional(),
})

interface MessagingSettingsTabProps {
  organizationId: string
  settings: {
    default_from_name: string
    default_reply_to: string
    notifications_enabled: boolean
    default_send_time?: string
  }
}

export function MessagingSettingsTab({ organizationId, settings }: MessagingSettingsTabProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      await updateMessagingSettings(organizationId, values)
      
      toast({
        title: "Settings updated",
        description: "Your messaging settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messaging Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="default_from_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default From Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    The name that will appear in the "From" field of emails
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_reply_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Reply-To Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormDescription>
                    The email address that recipients will reply to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notifications_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Email Notifications
                    </FormLabel>
                    <FormDescription>
                      Receive notifications about message delivery status
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
              name="default_send_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Send Time</FormLabel>
                  <FormControl>
                    <TimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Default time for scheduled messages (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              Save Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 