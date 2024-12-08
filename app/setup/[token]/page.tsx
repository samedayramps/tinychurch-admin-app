'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/client'
import { useToast } from '@/lib/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const setupFormSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function SetupPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<z.infer<typeof setupFormSchema>>({
    resolver: zodResolver(setupFormSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    const handleInvitation = async () => {
      try {
        const token = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token || type !== 'invite') {
          throw new Error('Invalid invitation link')
        }

        // Verify the OTP token
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'invite'
        })

        if (verifyError) throw verifyError

        setLoading(false)
      } catch (error) {
        console.error('Setup error:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Invalid invitation link',
          variant: 'destructive'
        })
        router.push('/sign-in')
      }
    }

    handleInvitation()
  }, [searchParams, router, supabase.auth, toast])

  const onSubmit = async (values: z.infer<typeof setupFormSchema>) => {
    try {
      setLoading(true)

      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password
      })

      if (updateError) throw updateError

      // Update profile status
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (profileError) throw profileError
      }

      toast({
        title: 'Success',
        description: 'Your account has been set up successfully'
      })

      router.push('/sign-in?message=Please sign in with your new password')
    } catch (error) {
      console.error('Setup error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to setup account',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Account Setup</CardTitle>
          <CardDescription>
            Please set a password for your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register('password')}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 