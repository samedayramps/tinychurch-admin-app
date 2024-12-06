'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

function AcceptInviteForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = searchParams.get('token_hash')
  const type = searchParams.get('type')

  useEffect(() => {
    if (!token || type !== 'invite') {
      router.push('/sign-in')
    }
  }, [token, type, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const supabase = createClient()

    try {
      // First verify the invite token
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token as string,
        type: 'invite',
      })

      if (verifyError) throw verifyError

      // Then set the new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) throw updateError

      router.push('/sign-in?message=Please sign in with your new password')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Accept Invitation</CardTitle>
        <CardDescription>
          Set your password to complete your account setup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Set Password & Accept Invite
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AcceptInviteForm />
    </Suspense>
  )
} 