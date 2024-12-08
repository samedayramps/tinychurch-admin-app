'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/hooks/use-toast'

function SetupContent() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      const code = searchParams.get('code')
      if (!code) return

      try {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) throw error
      } catch (error) {
        console.error('Error setting up auth:', error)
        toast({
          title: "Error",
          description: "Failed to authenticate. Please try again.",
          variant: "destructive"
        })
      }
    }

    handleAuthCallback()
  }, [searchParams, supabase.auth, toast])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const password = formData.get('password') as string

      // Update the user's password
      const { error: passwordError } = await supabase.auth.updateUser({
        password
      })

      if (passwordError) throw passwordError

      toast({
        title: "Success",
        description: "Your account has been set up successfully"
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to setup account",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Input name="password" type="password" placeholder="Enter your password" required />
      <Button type="submit" disabled={loading}>
        {loading ? 'Setting up...' : 'Setup Account'}
      </Button>
    </form>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SetupContent />
    </Suspense>
  )
} 